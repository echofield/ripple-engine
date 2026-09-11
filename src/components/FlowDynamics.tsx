"use client";
import { motion } from 'framer-motion';

interface FlowDynamicsProps {
  flow: {
    primary_flow: string;
    secondary_flow: string;
    choke_points: string[];
  };
}

export const FlowDynamics = ({ flow }: FlowDynamicsProps) => {
  if (!flow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="border-l-[2px] border-emerald/40 pl-4 py-3 bg-emerald/[0.03]"
    >
      <div className="text-[7px] tracking-[0.2em] uppercase text-emerald/60 mb-3 flex items-center gap-2">
        <span>Layer 03</span>
        <span className="text-emerald/30">//</span>
        <span className="font-bold">Flow Dynamics</span>
      </div>

      <div className="space-y-3">
        {/* Primary Flow */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 border border-emerald/40 bg-emerald/10 flex items-center justify-center">
              <div className="w-1 h-1 bg-emerald" />
            </div>
            <span className="text-[8px] tracking-wider uppercase text-ink/40">Primary Flow</span>
          </div>
          <p className="text-[11px] font-medium text-ink/80 leading-relaxed pl-4 italic">
            {flow.primary_flow}
          </p>
        </div>

        {/* Secondary Flow */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 border border-ink/20 flex items-center justify-center">
              <div className="w-1 h-1 bg-ink/30" />
            </div>
            <span className="text-[8px] tracking-wider uppercase text-ink/40">Counter-Flow</span>
          </div>
          <p className="text-[10px] text-ink/60 leading-relaxed pl-4">
            {flow.secondary_flow}
          </p>
        </div>

        {/* Choke Points */}
        {flow.choke_points && flow.choke_points.length > 0 && (
          <div className="pt-2 border-t border-ink/5">
            <span className="text-[7px] tracking-wider uppercase text-red-400/70 block mb-2">
              Choke Points
            </span>
            <div className="flex flex-wrap gap-1.5">
              {flow.choke_points.map((point, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-[8px] text-red-400/80"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
