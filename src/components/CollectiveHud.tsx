"use client";

import { motion } from 'framer-motion';
import type { KernelFeedEvent } from '@/hooks/useKernelAgent';

interface CollectiveHudProps {
  activity: {
    audioPacketsSent: number;
    framesSent: number;
    audioPacketsReceived: number;
    lastEventAt: string | null;
  };
  backendUrl: string;
  error: string | null;
  events: KernelFeedEvent[];
  isConnected: boolean;
  isStreaming: boolean;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
  onToggleStream: () => void | Promise<void>;
  status: string;
}

function statusTone(status: string): string {
  if (status === 'STREAMING' || status === 'LISTENING' || status === 'MIC_ACTIVE') {
    return 'text-emerald';
  }
  if (status === 'CONNECTED' || status === 'READY') {
    return 'text-blue-500';
  }
  if (status === 'CONNECTING') {
    return 'text-amber-500';
  }
  if (status === 'ERROR' || status === 'DISCONNECTED') {
    return 'text-red-500';
  }
  return 'text-ink/55';
}

export const CollectiveHud = ({
  activity,
  backendUrl,
  error,
  events,
  isConnected,
  isStreaming,
  onConnect,
  onDisconnect,
  onToggleStream,
  status,
}: CollectiveHudProps) => {
  return (
    <div className="bg-paper/95 backdrop-blur-xl border border-ink/10 shadow-xl p-4 w-[340px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[8px] tracking-[0.18em] uppercase text-ink/35">Collective HUD</div>
          <div className="text-[11px] font-semibold text-ink/70 mt-1">Kernel Control Plane</div>
        </div>
        <div className={`text-[8px] font-mono uppercase ${statusTone(status)}`}>{status}</div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => void onConnect()}
          disabled={isConnected}
          className="px-3 py-2 text-[8px] uppercase tracking-[0.15em] border border-emerald/30 text-emerald disabled:opacity-40"
        >
          Connect
        </button>
        <button
          onClick={() => void onToggleStream()}
          disabled={!isConnected && status === 'CONNECTING'}
          className={`px-3 py-2 text-[8px] uppercase tracking-[0.15em] border disabled:opacity-40 ${
            isStreaming
              ? 'border-red-500/30 text-red-600 bg-red-500/5'
              : 'border-amber-500/30 text-amber-600'
          }`}
        >
          {isStreaming ? 'Stop Live' : 'Start Live'}
        </button>
        <button
          onClick={() => void onDisconnect()}
          className="px-3 py-2 text-[8px] uppercase tracking-[0.15em] border border-ink/10 text-ink/45"
        >
          Off
        </button>
      </div>

      <div className="mb-3 rounded-sm border border-ink/10 bg-ink/[0.02] p-2">
        <div className="mb-2 flex items-center justify-between text-[7px] uppercase tracking-[0.15em] text-ink/35">
          <span>Live State</span>
          <span className={isStreaming ? 'text-emerald' : 'text-ink/40'}>
            {isStreaming ? 'Mic Active' : isConnected ? 'Connected' : 'Idle'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[9px] text-ink/60">
          <div className="border border-ink/10 bg-paper p-2">
            <div className="text-[7px] uppercase tracking-[0.12em] text-ink/35">Audio Out</div>
            <div className="mt-1 font-mono text-[11px] text-ink/75">{activity.audioPacketsSent}</div>
          </div>
          <div className="border border-ink/10 bg-paper p-2">
            <div className="text-[7px] uppercase tracking-[0.12em] text-ink/35">Frames</div>
            <div className="mt-1 font-mono text-[11px] text-ink/75">{activity.framesSent}</div>
          </div>
          <div className="border border-ink/10 bg-paper p-2">
            <div className="text-[7px] uppercase tracking-[0.12em] text-ink/35">Audio In</div>
            <div className="mt-1 font-mono text-[11px] text-ink/75">{activity.audioPacketsReceived}</div>
          </div>
        </div>
        <div className="mt-2 text-[8px] text-ink/45">
          {activity.lastEventAt
            ? `Last event ${new Date(activity.lastEventAt).toLocaleTimeString()}`
            : 'No live events yet.'}
        </div>
      </div>

      <div className="mb-3 p-2 bg-ink/[0.02] border border-ink/10">
        <div className="text-[7px] uppercase tracking-[0.15em] text-ink/35 mb-1">Endpoint</div>
        <div className="text-[9px] font-mono text-ink/55 break-all">{backendUrl}</div>
      </div>

      {!isStreaming && isConnected && (
        <div className="mb-3 border border-amber-500/20 bg-amber-500/5 p-2 text-[9px] text-amber-700">
          Live session is open. Click <span className="font-semibold">Start Live</span> to send mic audio and map frames.
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 border border-red-500/20 bg-red-500/5 text-[9px] text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {events.length === 0 && (
          <div className="text-[9px] text-ink/35 border border-dashed border-ink/10 p-3">
            No collective signals yet.
          </div>
        )}

        {events.map((event, index) => (
          <motion.div
            key={`${event.type}-${event.created_at ?? index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-ink/10 bg-paper p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] uppercase tracking-[0.15em] text-emerald font-bold">{event.type}</span>
              {event.created_at && <span className="text-[7px] font-mono text-ink/30">{new Date(event.created_at).toLocaleTimeString()}</span>}
            </div>
            <div className="text-[10px] text-ink/65 leading-relaxed">
              {event.payload.tag || event.payload.detail || event.payload.text || JSON.stringify(event.payload)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
