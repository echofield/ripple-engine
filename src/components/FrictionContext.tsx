"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface FrictionContextProps {
  context: string;
  onContextChange: (context: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FrictionContext = ({ context, onContextChange, isExpanded, onToggle }: FrictionContextProps) => {
  const hasContext = context.trim().length > 0;
  const previewText = context.slice(0, 150);

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full transition-colors ${hasContext ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
          <span className="text-[9px] tracking-[0.2em] uppercase font-medium text-ink/50 group-hover:text-ink/70 transition-colors">
            Friction Report
          </span>
          {hasContext && (
            <span className="text-[8px] tracking-wider uppercase text-emerald/70 px-2 py-0.5 bg-emerald/10 border border-emerald/20">
              Loaded
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-ink/30 text-xs"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30">
                <span>Paste deep research output</span>
                <div className="flex-1 h-[1px] bg-ink/5" />
              </div>

              <textarea
                value={context}
                onChange={(e) => onContextChange(e.target.value)}
                placeholder={`Paste your friction report here...

Example:
- RER B: Closed March 14-15 for maintenance (Gare du Nord - CDG)
- France vs England Rugby: Stade de France, 21:00 March 15, 80,000 attendees
- Weather: Rain expected 14:00-18:00, 12°C
- Fashion Week teardown: Le Marais blocked trucks until March 16`}
                className="w-full h-32 bg-ink/[0.02] border border-ink/10 p-3 text-xs text-ink/70 placeholder:text-ink/20 resize-none focus:outline-none focus:border-emerald/30 transition-colors"
              />

              {hasContext && (
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-emerald/60 uppercase tracking-wider">
                    {context.split('\n').filter(l => l.trim()).length} friction sources detected
                  </span>
                  <button
                    onClick={() => onContextChange('')}
                    className="text-[8px] text-red-500/50 hover:text-red-500 uppercase tracking-wider transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && hasContext && (
        <div className="mt-2 text-[9px] text-ink/30 truncate">
          {previewText}...
        </div>
      )}
    </div>
  );
};
