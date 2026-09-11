"use client";
import { motion } from 'framer-motion';

const PROFESSIONS = [
  { id: 'VTC_DRIVER', label: 'VTC Driver', icon: '◈' },
  { id: 'WAITER', label: 'Waiter', icon: '◇' },
  { id: 'DELIVERY', label: 'Delivery', icon: '◆' },
  { id: 'RETAIL', label: 'Retail', icon: '□' },
  { id: 'TOURIST', label: 'Tourist', icon: '○' },
];

interface ProfessionSelectorProps {
  active: string | null;
  onChange: (profession: string) => void;
}

export const ProfessionSelector = ({ active, onChange }: ProfessionSelectorProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-[1px] bg-emerald/30" />
        <span className="text-[8px] tracking-[0.25em] uppercase font-medium text-ink/40">
          Select Your Lens
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PROFESSIONS.map((prof, index) => (
          <motion.button
            key={prof.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onChange(prof.id)}
            className={`
              group relative px-4 py-2 border transition-all duration-300 ease-out
              ${active === prof.id
                ? 'bg-emerald text-paper border-emerald shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-transparent text-ink/50 border-ink/10 hover:border-emerald/40 hover:text-ink/80'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${active === prof.id ? 'text-paper/80' : 'text-emerald/60'}`}>
                {prof.icon}
              </span>
              <span className="text-[9px] tracking-[0.15em] uppercase font-medium">
                {prof.label}
              </span>
            </div>

            {active === prof.id && (
              <motion.div
                layoutId="profession-indicator"
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-paper/40"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-ink/5"
        >
          <p className="text-[10px] text-ink/30 italic tracking-wide">
            Viewing the fictional demo through the lens of a <span className="text-emerald/70 not-italic font-medium">{active.replace('_', ' ').toLowerCase()}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
};
