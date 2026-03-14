"use client";
import { motion } from 'framer-motion';

interface SovereignDecisionProps {
  decision: {
    action: string;
    target: string;
    logic: string;
    confidence: number;
  };
  profession: string;
}

export const SovereignDecision = ({ decision, profession }: SovereignDecisionProps) => {
  if (!decision) return null;

  const confidenceColor = decision.confidence > 0.8
    ? 'text-emerald'
    : decision.confidence > 0.5
      ? 'text-amber-500'
      : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald/10 via-emerald/5 to-transparent" />

      <div className="relative border-2 border-emerald bg-paper p-6">
        {/* Header badge */}
        <div className="absolute -top-3 left-4 px-3 py-1 bg-emerald text-paper text-[8px] tracking-[0.2em] uppercase font-bold">
          Sovereign Decision
        </div>

        {/* Confidence indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-[7px] tracking-wider uppercase text-ink/30">Confidence</span>
          <span className={`font-mono text-[10px] font-bold ${confidenceColor}`}>
            {Math.round(decision.confidence * 100)}%
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {/* The Command */}
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] tracking-[0.15em] uppercase text-ink/40">Action</span>
            <span className="text-2xl font-black tracking-wider text-ink uppercase">
              [{decision.action}]
            </span>
          </div>

          {/* Target */}
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] tracking-[0.15em] uppercase text-ink/40">Target</span>
            <span className="text-lg font-bold text-emerald tracking-wide">
              {decision.target}
            </span>
          </div>

          {/* Logic */}
          <div className="pt-3 border-t border-ink/10">
            <span className="text-[8px] tracking-[0.15em] uppercase text-ink/30 block mb-1">Logic</span>
            <p className="text-[11px] text-ink/70 leading-relaxed font-medium italic">
              {decision.logic}
            </p>
          </div>

          {/* Profession context */}
          <div className="flex items-center justify-between pt-2 border-t border-ink/5">
            <span className="text-[8px] tracking-wider uppercase text-ink/30">
              Optimized for: {profession.replace('_', ' ')}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 ${i <= Math.round(decision.confidence * 5) ? 'bg-emerald' : 'bg-ink/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
