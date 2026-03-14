"use client";
import { motion } from 'framer-motion';

interface DeltaData {
  status_quo: string;
  post_signal: string;
  change_percent: number;
  risk_level: number;
}

interface DifferenceEngineProps {
  delta: DeltaData;
  profession: string;
}

export const DifferenceEngine = ({ delta, profession }: DifferenceEngineProps) => {
  if (!delta) return null;

  const isPositive = delta.change_percent > 0;
  const isNeutral = delta.change_percent === 0;

  const changeColor = isPositive
    ? 'text-emerald'
    : isNeutral
      ? 'text-ink/50'
      : 'text-red-400';

  const riskColor = delta.risk_level > 0.7
    ? 'bg-red-500'
    : delta.risk_level > 0.4
      ? 'bg-amber-500'
      : 'bg-emerald';

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 bg-blue-500 animate-pulse" />
        <span className="text-[8px] tracking-[0.2em] uppercase text-ink/40">
          Difference Engine
        </span>
      </div>

      <div className="space-y-3">
        {/* Status Quo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="border border-ink/10 bg-ink/[0.02] p-3"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] tracking-[0.15em] uppercase text-ink/30">
              Status Quo
            </span>
            <span className="text-[7px] tracking-wider uppercase text-ink/20 px-1.5 py-0.5 border border-ink/10">
              Baseline
            </span>
          </div>
          <div className="text-[10px] text-ink/60">
            {delta.status_quo}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center text-ink/20 text-xs"
        >
          ↓ SIGNAL APPLIED ↓
        </motion.div>

        {/* Post Signal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-amber-500/30 bg-amber-500/5 p-3"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] tracking-[0.15em] uppercase text-amber-500/70">
              Post-Signal
            </span>
            <span className="text-[7px] tracking-wider uppercase text-amber-500/50 px-1.5 py-0.5 border border-amber-500/20">
              Projected
            </span>
          </div>
          <div className="text-[10px] text-ink/70">
            {delta.post_signal}
          </div>
        </motion.div>

        {/* Delta Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="border-2 border-dashed border-ink/20 p-4 text-center"
        >
          <div className="text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
            Impact Delta
          </div>
          <div className={`text-3xl font-bold ${changeColor} font-mono`}>
            {isPositive ? '+' : ''}{delta.change_percent}%
          </div>
          <div className="text-[9px] text-ink/40 mt-1 uppercase tracking-wider">
            {isPositive ? 'Opportunity' : isNeutral ? 'Neutral' : 'Risk'}
          </div>

          {/* Risk meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[7px] text-ink/30 mb-1">
              <span>RISK</span>
              <span>{Math.round(delta.risk_level * 100)}%</span>
            </div>
            <div className="h-1.5 bg-ink/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${delta.risk_level * 100}%` }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className={`h-full ${riskColor}`}
              />
            </div>
          </div>
        </motion.div>

        {/* Profession context */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[8px] text-ink/30 text-center uppercase tracking-wider"
        >
          Analysis for: {profession.replace('_', ' ')}
        </motion.div>
      </div>
    </div>
  );
};
