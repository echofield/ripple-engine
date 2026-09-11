"use client";
import { motion } from 'framer-motion';

interface CausalNode {
  node: string;
  type: 'trigger' | 'amplifier' | 'outcome';
  value: string;
  leads_to: string | null;
}

interface CausalAncestryProps {
  chain: CausalNode[];
  profession: string;
}

const nodeColors = {
  trigger: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', glow: 'shadow-red-500/20' },
  amplifier: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  outcome: { bg: 'bg-emerald/20', border: 'border-emerald/50', text: 'text-emerald', glow: 'shadow-emerald/20' },
};

export const CausalAncestry = ({ chain, profession }: CausalAncestryProps) => {
  if (!chain || chain.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 bg-emerald animate-pulse" />
        <span className="text-[8px] tracking-[0.2em] uppercase text-ink/40">
          Causal Ancestry
        </span>
        <span className="text-[7px] tracking-wider uppercase text-emerald/50 px-1.5 py-0.5 border border-emerald/20">
          {profession.replace('_', ' ')}
        </span>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-red-500/30 via-amber-500/30 to-emerald/30" />

        <div className="space-y-2">
          {chain.map((node, index) => {
            const colors = nodeColors[node.type];
            const isLast = index === chain.length - 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.3 }}
                className="relative flex items-start gap-3"
              >
                {/* Node indicator */}
                <div className={`
                  relative z-10 w-6 h-6 rounded-full flex items-center justify-center
                  ${colors.bg} ${colors.border} border shadow-lg ${colors.glow}
                `}>
                  {node.type === 'trigger' && <span className="text-[10px]">!</span>}
                  {node.type === 'amplifier' && <span className="text-[10px]">+</span>}
                  {node.type === 'outcome' && <span className="text-[10px]">=</span>}
                </div>

                {/* Node content */}
                <div className={`
                  flex-1 px-3 py-2 border ${colors.border} ${colors.bg}
                  backdrop-blur-sm
                `}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold tracking-wider uppercase ${colors.text}`}>
                      {node.node}
                    </span>
                    <span className="text-[7px] tracking-wider uppercase text-ink/30">
                      {node.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink/60 font-mono">
                    {node.value}
                  </div>
                </div>

                {/* Arrow to next */}
                {!isLast && node.leads_to && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.1 }}
                    className="absolute -bottom-1 left-[9px] text-[8px] text-ink/20"
                  >
                    ↓
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Formula representation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: chain.length * 0.15 + 0.2 }}
        className="mt-4 pt-3 border-t border-ink/10"
      >
        <div className="text-[8px] tracking-wider uppercase text-ink/30 mb-2">
          Causal Formula
        </div>
        <div className="font-mono text-[9px] text-ink/50 flex flex-wrap items-center gap-1">
          {chain.map((node, index) => (
            <span key={index} className="flex items-center gap-1">
              <span className={nodeColors[node.type].text}>
                [{node.node}]
              </span>
              {index < chain.length - 1 && (
                <span className="text-ink/30">→</span>
              )}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
