"use client";

import { motion } from 'framer-motion';
import type { KernelFeedEvent } from '@/hooks/useKernelAgent';

interface CollectiveHudProps {
  backendUrl: string;
  error: string | null;
  events: KernelFeedEvent[];
  isConnected: boolean;
  isStreaming: boolean;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
  onStream: () => void | Promise<void>;
  status: string;
}

export const CollectiveHud = ({
  backendUrl,
  error,
  events,
  isConnected,
  isStreaming,
  onConnect,
  onDisconnect,
  onStream,
  status,
}: CollectiveHudProps) => {
  return (
    <div className="bg-paper/95 backdrop-blur-xl border border-ink/10 shadow-xl p-4 w-[320px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[8px] tracking-[0.18em] uppercase text-ink/35">Collective HUD</div>
          <div className="text-[11px] font-semibold text-ink/70 mt-1">Kernel Control Plane</div>
        </div>
        <div className="text-[8px] font-mono text-emerald uppercase">{status}</div>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => void onConnect()}
          disabled={isConnected}
          className="flex-1 px-3 py-2 text-[8px] uppercase tracking-[0.15em] border border-emerald/30 text-emerald disabled:opacity-40"
        >
          Connect
        </button>
        <button
          onClick={() => void onStream()}
          disabled={!isConnected || isStreaming}
          className="flex-1 px-3 py-2 text-[8px] uppercase tracking-[0.15em] border border-amber-500/30 text-amber-600 disabled:opacity-40"
        >
          {isStreaming ? 'Streaming' : 'Start Live'}
        </button>
        <button
          onClick={() => void onDisconnect()}
          className="px-3 py-2 text-[8px] uppercase tracking-[0.15em] border border-ink/10 text-ink/45"
        >
          Off
        </button>
      </div>

      <div className="mb-3 p-2 bg-ink/[0.02] border border-ink/10">
        <div className="text-[7px] uppercase tracking-[0.15em] text-ink/35 mb-1">Endpoint</div>
        <div className="text-[9px] font-mono text-ink/55 break-all">{backendUrl}</div>
      </div>

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
              {event.payload.tag || event.payload.text || JSON.stringify(event.payload)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
