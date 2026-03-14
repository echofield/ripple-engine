"use client";
import { motion } from 'framer-motion';

interface MacroTickerProps {
  macroStrain?: {
    index: number;
    primary_factor: string;
  };
  fieldState?: {
    friction_index: number;
    density_pressure: string;
    summary: string;
  };
  isActive: boolean;
}

export const MacroTicker = ({ macroStrain, fieldState, isActive }: MacroTickerProps) => {
  // Default values when no data
  const strain = macroStrain?.index ?? 0.72;
  const strainFactor = macroStrain?.primary_factor ?? 'ZFE Enforcement Cliff';
  const friction = fieldState?.friction_index ?? 0.85;
  const density = fieldState?.density_pressure ?? 'high';

  const strainColor = strain > 0.7 ? 'text-red-400' : strain > 0.4 ? 'text-amber-500' : 'text-emerald';
  const frictionColor = friction > 0.7 ? 'text-red-400' : friction > 0.4 ? 'text-amber-500' : 'text-emerald';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
      className="font-mono text-[9px] tracking-wider"
    >
      <div className="flex items-center gap-6">
        {/* Macro Strain */}
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${strain > 0.7 ? 'bg-red-400 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-ink/40">MACRO_STRAIN:</span>
          <span className={`font-bold ${strainColor}`}>{strain.toFixed(2)}</span>
          <span className="text-ink/30">//</span>
          <span className="text-ink/50 truncate max-w-[140px]">{strainFactor}</span>
        </div>

        <div className="w-[1px] h-3 bg-ink/10" />

        {/* Field State */}
        <div className="flex items-center gap-2">
          <span className="text-ink/40">FIELD_STATE:</span>
          <span className={`font-bold ${frictionColor}`}>{friction.toFixed(2)}</span>
          <span className="text-ink/30">//</span>
          <span className={`uppercase ${density === 'critical' ? 'text-red-400' : 'text-ink/50'}`}>
            {density}
          </span>
        </div>

        {/* Pulse indicator */}
        {isActive && (
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1 ml-4"
          >
            <div className="w-1 h-1 bg-emerald rounded-full" />
            <span className="text-emerald/70 text-[8px]">LIVE</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
