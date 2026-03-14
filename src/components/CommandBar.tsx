"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PROFESSIONS = [
  { id: 'VTC_DRIVER', label: 'VTC' },
  { id: 'WAITER', label: 'Waiter' },
  { id: 'DELIVERY', label: 'Delivery' },
  { id: 'RETAIL', label: 'Retail' },
  { id: 'TOURIST', label: 'Tourist' },
];

interface CommandBarProps {
  profession: string | null;
  onProfessionChange: (p: string) => void;
  onSimulate: (signal: string) => void;
  isProcessing: boolean;
  hasData: boolean;
}

export const CommandBar = ({
  profession,
  onProfessionChange,
  onSimulate,
  isProcessing,
  hasData
}: CommandBarProps) => {
  const [signal, setSignal] = useState('');

  const handleSubmit = () => {
    if (signal.trim() && profession && !isProcessing) {
      onSimulate(signal);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Lens Selector */}
      <div className="flex justify-center gap-1 mb-3">
        {PROFESSIONS.map((p) => (
          <button
            key={p.id}
            onClick={() => onProfessionChange(p.id)}
            className={`
              px-3 py-1 text-[8px] tracking-[0.15em] uppercase font-bold transition-all
              ${profession === p.id
                ? 'bg-emerald text-paper'
                : 'bg-paper/60 text-ink/40 hover:text-ink/70 border border-ink/10'
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Command Input */}
      <div className="relative bg-paper/95 backdrop-blur-xl border border-ink/20 shadow-2xl">
        {/* Data indicator */}
        {hasData && (
          <div className="absolute -top-2 right-4 px-2 py-0.5 bg-emerald text-paper text-[6px] tracking-wider uppercase font-bold">
            Twin Active
          </div>
        )}

        <div className="flex items-center p-4">
          <span className="text-emerald font-mono text-sm mr-3 opacity-70">
            SIGNAL &gt;
          </span>
          <input
            value={signal}
            onChange={(e) => setSignal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={!profession || isProcessing}
            className="flex-1 bg-transparent outline-none text-ink font-mono text-sm placeholder:text-ink/20"
            placeholder={profession ? "Rain at Gare du Nord..." : "Select lens first..."}
          />
          <AnimatePresence>
            {signal.trim() && profession && !isProcessing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSubmit}
                className="ml-4 px-4 py-2 bg-emerald text-paper text-[9px] tracking-wider uppercase font-bold hover:bg-emerald/90 transition-colors"
              >
                Execute
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-[2px] bg-emerald"
          />
        )}
      </div>

      {/* Hint */}
      {!profession && (
        <div className="text-center mt-2 text-[8px] text-ink/30 uppercase tracking-wider">
          Select a lens to begin
        </div>
      )}
    </div>
  );
};
