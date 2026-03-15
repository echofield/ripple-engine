"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface KernelFeedEvent {
  type: 'TOKEN_MINTED' | 'NARRATION' | 'SESSION_STATE' | 'ERROR';
  payload: Record<string, any>;
  created_at?: string;
}

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8080';
const FRAME_INTERVAL_MS = 1000;
const AUDIO_BUFFER_SIZE = 4096;
const TARGET_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

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
  const latestEventRef = useRef<KernelFeedEvent | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<KernelFeedEvent[]>([]);

  const pushEvent = useCallback((event: KernelFeedEvent) => {
    latestEventRef.current = event;
    setEvents(prev => [event, ...prev].slice(0, 12));
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
  }, [ensurePlaybackContext]);

  const sendRealtimePayload = useCallback((payload: Record<string, any>) => {
    const socket = liveSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'realtime_input',
        session_id: 'browser-live',
        realtime_input: payload,
      })
    );
  }, []);

  const stopStreaming = useCallback(async () => {
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
  }, []);

  const disconnect = useCallback(async () => {
    await stopStreaming();
    liveSocketRef.current?.close();
    feedSocketRef.current?.close();
    liveSocketRef.current = null;
    feedSocketRef.current = null;
    setIsConnected(false);
    setStatus('DISCONNECTED');
  }, [stopStreaming]);

  const startStreaming = useCallback(async () => {
    if (isStreaming) {
      return;
    }

    const socket = liveSocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Live socket is not connected.');
    }

    await ensurePlaybackContext();

    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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
      sendRealtimePayload({
        audio: bytesToBase64(bytes),
        mime_type: 'audio/pcm;rate=16000',
        metadata: { source: 'browser-mic' },
      });
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    frameTimerRef.current = window.setInterval(() => {
      const frame = captureMapFrame();
      if (!frame) {
        return;
      }

      sendRealtimePayload({
        image: frame,
        image_mime_type: 'image/jpeg',
        metadata: { source: 'map-canvas' },
      });
    }, FRAME_INTERVAL_MS);

    setIsStreaming(true);
    setStatus('STREAMING');
  }, [ensurePlaybackContext, isStreaming, sendRealtimePayload]);

  const connect = useCallback(async () => {
    if (isConnected) {
      return;
    }

    setError(null);

    const liveSocket = new WebSocket(toWebSocketUrl(backendUrl, '/ws/live'));
    const feedSocket = new WebSocket(toWebSocketUrl(backendUrl, '/ws/feed'));

    liveSocket.binaryType = 'arraybuffer';
    liveSocketRef.current = liveSocket;
    feedSocketRef.current = feedSocket;

    await new Promise<void>((resolve, reject) => {
      let opened = 0;
      const handleOpen = () => {
        opened += 1;
        if (opened === 2) {
          setIsConnected(true);
          setStatus('CONNECTED');
          resolve();
        }
      };

      const handleError = () => reject(new Error('Failed to connect to the control plane.'));

      liveSocket.addEventListener('open', handleOpen, { once: true });
      feedSocket.addEventListener('open', handleOpen, { once: true });
      liveSocket.addEventListener('error', handleError, { once: true });
      feedSocket.addEventListener('error', handleError, { once: true });
    });

    liveSocket.onmessage = event => {
      if (typeof event.data === 'string') {
        const parsed = JSON.parse(event.data) as KernelFeedEvent;
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
      pushEvent(parsed);
    };

    const handleClose = () => {
      setIsConnected(false);
      setIsStreaming(false);
      setStatus('DISCONNECTED');
    };

    liveSocket.onclose = handleClose;
    feedSocket.onclose = handleClose;
  }, [backendUrl, isConnected, playAudioChunk, pushEvent]);

  const connectAndStream = useCallback(async () => {
    try {
      await connect();
      await startStreaming();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Failed to start live stream.';
      setError(message);
      setStatus('ERROR');
    }
  }, [connect, startStreaming]);

  const sendTextSignal = useCallback((text: string, metadata: Record<string, any> = {}) => {
    sendRealtimePayload({
      text,
      metadata: {
        source: 'dashboard',
        ...metadata,
      },
    });
  }, [sendRealtimePayload]);

  useEffect(() => {
    return () => {
      void disconnect();
      if (playbackContextRef.current) {
        void playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, [disconnect]);

  return {
    backendUrl,
    connect,
    connectAndStream,
    disconnect,
    error,
    events,
    isConnected,
    isStreaming,
    latestEvent: latestEventRef.current,
    sendTextSignal,
    startStreaming,
    status,
    stopStreaming,
  };
}
