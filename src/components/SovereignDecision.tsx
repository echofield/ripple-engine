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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative"
    >
      <div className="space-y-4">
        {/* The Command - HERO */}
        <div className="text-center">
          <span className="text-3xl font-black tracking-wider text-ink uppercase">
            [{decision.action}]
          </span>
        </div>

        {/* Target - Secondary Hero */}
        <div className="text-center">
          <span className="text-xl font-bold text-emerald tracking-wide leading-tight block">
            {decision.target}
          </span>
        </div>

        {/* Confidence Bar */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div
                key={i}
                className={`w-2 h-4 ${i <= Math.round(decision.confidence * 10) ? 'bg-emerald' : 'bg-ink/10'}`}
              />
            ))}
          </div>
          <span className={`font-mono text-sm font-bold ${confidenceColor}`}>
            {Math.round(decision.confidence * 100)}%
          </span>
        </div>

        {/* Logic */}
        <div className="pt-3 border-t border-ink/10">
          <span className="text-[8px] tracking-[0.15em] uppercase text-ink/30 block mb-2">Rationale</span>
          <p className="text-[12px] text-ink/70 leading-relaxed">
            {decision.logic}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
