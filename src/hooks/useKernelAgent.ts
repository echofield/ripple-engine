"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface KernelFeedEvent {
  type: 'TOKEN_MINTED' | 'NARRATION' | 'SESSION_STATE' | 'ERROR';
  payload: Record<string, any>;
  created_at?: string;
}

interface KernelActivity {
  audioPacketsSent: number;
  framesSent: number;
  audioPacketsReceived: number;
  lastEventAt: string | null;
}

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8080';
const FRAME_INTERVAL_MS = 1000;
const AUDIO_BUFFER_SIZE = 4096;
const TARGET_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

// Debug logging
const DEBUG = true;
function log(tag: string, ...args: unknown[]) {
  if (DEBUG) {
    console.log(`[KernelAgent:${tag}]`, new Date().toISOString(), ...args);
  }
}

function toWebSocketUrl(baseUrl: string, path: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = path;
  url.search = '';
  url.hash = '';
  return url.toString();
}

function downsampleToPcm16(input: Float32Array, sampleRate: number): Int16Array {
  if (sampleRate === TARGET_SAMPLE_RATE) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
  }

  const ratio = sampleRate / TARGET_SAMPLE_RATE;
  const length = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(length);

  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < output.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accumulator = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < input.length; i += 1) {
      accumulator += input[i];
      count += 1;
    }

    const sample = count > 0 ? accumulator / count : 0;
    const clamped = Math.max(-1, Math.min(1, sample));
    output[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return output;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j += 1) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return window.btoa(binary);
}

function captureMapFrame(): string | null {
  const canvas = document.querySelector('canvas.mapboxgl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    return null;
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.68);
  const [, base64] = dataUrl.split(',');
  return base64 ?? null;
}

function pcm16ToAudioBuffer(context: AudioContext, chunk: ArrayBuffer, sampleRate: number): AudioBuffer {
  const samples = new Int16Array(chunk);
  const buffer = context.createBuffer(1, samples.length, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < samples.length; i += 1) {
    channel[i] = samples[i] / 0x8000;
  }

  return buffer;
}

export function useKernelAgent() {
  const backendUrl = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL, []);

  const liveSocketRef = useRef<WebSocket | null>(null);
  const feedSocketRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackCursorRef = useRef(0);
  const frameTimerRef = useRef<number | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<KernelFeedEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<KernelFeedEvent | null>(null);
  const [activity, setActivity] = useState<KernelActivity>({
    audioPacketsSent: 0,
    framesSent: 0,
    audioPacketsReceived: 0,
    lastEventAt: null,
  });

  const pushEvent = useCallback((event: KernelFeedEvent) => {
    setLatestEvent(event);
    setEvents(prev => [event, ...prev].slice(0, 12));
    setActivity(prev => ({
      ...prev,
      lastEventAt: event.created_at ?? new Date().toISOString(),
    }));
  }, []);

  const ensurePlaybackContext = useCallback(async () => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      playbackCursorRef.current = playbackContextRef.current.currentTime;
    }

    if (playbackContextRef.current.state === 'suspended') {
      await playbackContextRef.current.resume();
    }

    return playbackContextRef.current;
  }, []);

  const playAudioChunk = useCallback(async (chunk: ArrayBuffer) => {
    const context = await ensurePlaybackContext();
    const audioBuffer = pcm16ToAudioBuffer(context, chunk, OUTPUT_SAMPLE_RATE);
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);

    const startAt = Math.max(context.currentTime, playbackCursorRef.current);
    source.start(startAt);
    playbackCursorRef.current = startAt + audioBuffer.duration;
    setActivity(prev => ({ ...prev, audioPacketsReceived: prev.audioPacketsReceived + 1 }));
  }, [ensurePlaybackContext]);

  const sendRealtimePayload = useCallback((payload: Record<string, any>) => {
    const socket = liveSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(
      JSON.stringify({
        type: 'realtime_input',
        session_id: 'browser-live',
        realtime_input: payload,
      })
    );

    return true;
  }, []);

  const stopStreaming = useCallback(async () => {
    log('stopStreaming', 'called, isStreaming=', isStreaming, 'hasMediaStream=', !!mediaStreamRef.current);

    if (frameTimerRef.current) {
      window.clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }

    inputProcessorRef.current?.disconnect();
    inputProcessorRef.current = null;

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    setIsStreaming(false);
    setStatus(isConnected ? 'READY' : 'DISCONNECTED');
    pushEvent({
      type: 'SESSION_STATE',
      payload: { status: 'MIC_OFF', detail: 'Live capture stopped.' },
      created_at: new Date().toISOString(),
    });
    log('stopStreaming', 'completed');
  }, [isConnected, isStreaming, pushEvent]);

  const disconnect = useCallback(async () => {
    log('disconnect', 'called, isConnected=', isConnected, 'hasLiveSocket=', !!liveSocketRef.current);
    await stopStreaming();
    liveSocketRef.current?.close();
    feedSocketRef.current?.close();
    liveSocketRef.current = null;
    feedSocketRef.current = null;
    setIsConnected(false);
    setStatus('DISCONNECTED');
    log('disconnect', 'completed');
  }, [isConnected, stopStreaming]);

  const startStreaming = useCallback(async () => {
    log('startStreaming', 'called, isStreaming=', isStreaming);

    if (isStreaming) {
      log('startStreaming', 'already streaming, returning');
      return;
    }

    const socket = liveSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      log('startStreaming', 'socket not open, readyState=', socket?.readyState);
      throw new Error('Live socket is not connected.');
    }

    log('startStreaming', 'ensuring playback context');
    await ensurePlaybackContext();

    log('startStreaming', 'requesting microphone permission');
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    log('startStreaming', 'microphone permission granted');

    // Check if socket is still open after async getUserMedia
    if (!liveSocketRef.current || liveSocketRef.current.readyState !== WebSocket.OPEN) {
      log('startStreaming', 'socket closed during getUserMedia, aborting');
      mediaStream.getTracks().forEach(track => track.stop());
      throw new Error('Live socket closed during microphone permission request.');
    }

    mediaStreamRef.current = mediaStream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(AUDIO_BUFFER_SIZE, 1, 1);
    inputProcessorRef.current = processor;

    processor.onaudioprocess = event => {
      const input = event.inputBuffer.getChannelData(0);
      const pcm16 = downsampleToPcm16(input, audioContext.sampleRate);
      const bytes = new Uint8Array(pcm16.buffer);
      const sent = sendRealtimePayload({
        audio: bytesToBase64(bytes),
        mime_type: 'audio/pcm;rate=16000',
        metadata: { source: 'browser-mic' },
      });

      if (sent) {
        setActivity(prev => ({ ...prev, audioPacketsSent: prev.audioPacketsSent + 1 }));
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    frameTimerRef.current = window.setInterval(() => {
      const frame = captureMapFrame();
      if (!frame) {
        return;
      }

      const sent = sendRealtimePayload({
        image: frame,
        image_mime_type: 'image/jpeg',
        metadata: { source: 'map-canvas' },
      });

      if (sent) {
        setActivity(prev => ({ ...prev, framesSent: prev.framesSent + 1 }));
      }
    }, FRAME_INTERVAL_MS);

    setIsStreaming(true);
    setStatus('LISTENING');
    pushEvent({
      type: 'SESSION_STATE',
      payload: { status: 'MIC_ACTIVE', detail: 'Microphone and map frames are streaming.' },
      created_at: new Date().toISOString(),
    });
    log('startStreaming', 'completed successfully');
  }, [ensurePlaybackContext, isStreaming, pushEvent, sendRealtimePayload]);

  const connect = useCallback(async () => {
    log('connect', 'called, isConnected=', isConnected);

    if (isConnected) {
      log('connect', 'already connected, returning');
      return;
    }

    setError(null);
    setStatus('CONNECTING');

    const liveWsUrl = toWebSocketUrl(backendUrl, '/ws/live');
    const feedWsUrl = toWebSocketUrl(backendUrl, '/ws/feed');
    log('connect', 'creating sockets', liveWsUrl, feedWsUrl);

    const liveSocket = new WebSocket(liveWsUrl);
    const feedSocket = new WebSocket(feedWsUrl);

    liveSocket.binaryType = 'arraybuffer';
    liveSocketRef.current = liveSocket;
    feedSocketRef.current = feedSocket;

    liveSocket.onclose = (event) => {
      log('liveSocket.onclose', 'code=', event.code, 'reason=', event.reason, 'wasClean=', event.wasClean);
      // Only update state if this is still our active socket
      if (liveSocketRef.current === liveSocket) {
        setIsConnected(false);
        setStatus('DISCONNECTED');
      }
    };

    feedSocket.onclose = (event) => {
      log('feedSocket.onclose', 'code=', event.code, 'reason=', event.reason, 'wasClean=', event.wasClean);
      // Feed socket closing doesn't necessarily mean session is over
    };

    liveSocket.onerror = (event) => {
      log('liveSocket.onerror', event);
    };

    feedSocket.onerror = (event) => {
      log('feedSocket.onerror', event);
    };

    try {
      await new Promise<void>((resolve, reject) => {
        let opened = 0;
        let failed = false;

        const handleOpen = (e: Event) => {
          if (failed) return;
          const socketType = e.target === liveSocket ? 'live' : 'feed';
          log('connect', `${socketType}Socket.onopen`);
          opened += 1;
          if (opened === 2) {
            log('connect', 'both sockets open');
            setIsConnected(true);
            setStatus('CONNECTED');
            resolve();
          }
        };

        const handleError = (e: Event) => {
          if (failed) return;
          failed = true;
          const socketType = e.target === liveSocket ? 'live' : 'feed';
          log('connect', `${socketType}Socket connection error`);
          reject(new Error(`Failed to connect to ${socketType} socket.`));
        };

        liveSocket.addEventListener('open', handleOpen, { once: true });
        feedSocket.addEventListener('open', handleOpen, { once: true });
        liveSocket.addEventListener('error', handleError, { once: true });
        feedSocket.addEventListener('error', handleError, { once: true });
      });
    } catch (err) {
      log('connect', 'connection failed', err);
      liveSocket.close();
      feedSocket.close();
      liveSocketRef.current = null;
      feedSocketRef.current = null;
      throw err;
    }

    liveSocket.onmessage = event => {
      if (typeof event.data === 'string') {
        const parsed = JSON.parse(event.data) as KernelFeedEvent;
        log('liveSocket.onmessage', 'text event', parsed.type);
        if (parsed.type === 'SESSION_STATE' && parsed.payload.status) {
          setStatus(String(parsed.payload.status));
        }
        pushEvent(parsed);
        return;
      }

      const chunk = event.data instanceof ArrayBuffer ? event.data : null;
      if (!chunk) {
        return;
      }

      void playAudioChunk(chunk).catch(cause => {
        const message = cause instanceof Error ? cause.message : 'Audio playback failed.';
        setError(message);
      });
    };

    feedSocket.onmessage = event => {
      const parsed = JSON.parse(event.data) as KernelFeedEvent;
      log('feedSocket.onmessage', parsed.type);
      pushEvent(parsed);
    };

    log('connect', 'completed successfully');
  }, [backendUrl, isConnected, playAudioChunk, pushEvent]);

  const connectAndStream = useCallback(async () => {
    log('connectAndStream', 'called');
    try {
      await connect();
      log('connectAndStream', 'connect completed, starting streaming');
      await startStreaming();
      log('connectAndStream', 'streaming started');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Failed to start live stream.';
      log('connectAndStream', 'error:', message);
      setError(message);
      setStatus('ERROR');
    }
  }, [connect, startStreaming]);

  const toggleStreaming = useCallback(async () => {
    log('toggleStreaming', 'called, isStreaming=', isStreaming, 'isConnected=', isConnected);

    if (isStreaming) {
      await stopStreaming();
      return;
    }

    if (!isConnected) {
      await connectAndStream();
      return;
    }

    await startStreaming();
  }, [connectAndStream, isConnected, isStreaming, startStreaming, stopStreaming]);

  const sendTextSignal = useCallback((text: string, metadata: Record<string, any> = {}) => {
    sendRealtimePayload({
      text,
      metadata: {
        source: 'dashboard',
        ...metadata,
      },
    });
  }, [sendRealtimePayload]);

  // Use a ref to track the latest disconnect function to avoid cleanup
  // running when disconnect changes (which happens when isConnected changes).
  // The bug was: useEffect cleanup runs when `disconnect` dependency changes,
  // which happens right after connect succeeds, causing immediate teardown.
  const disconnectRef = useRef(disconnect);
  disconnectRef.current = disconnect;

  useEffect(() => {
    log('useEffect', 'mount - setting up cleanup');
    return () => {
      log('useEffect', 'unmount - running cleanup');
      void disconnectRef.current();
      if (playbackContextRef.current) {
        void playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, []); // Empty deps = only runs on mount/unmount

  return {
    activity,
    backendUrl,
    connect,
    connectAndStream,
    disconnect,
    error,
    events,
    isConnected,
    isStreaming,
    latestEvent,
    sendTextSignal,
    startStreaming,
    status,
    stopStreaming,
    toggleStreaming,
  };
}
