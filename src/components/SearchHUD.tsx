"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ProfessionSelector } from './ProfessionSelector';

interface SearchHUDProps {
  onSimulate: (signal: string) => void;
  profession: string | null;
  onProfessionChange: (profession: string) => void;
}

export const SearchHUD = ({ onSimulate, profession, onProfessionChange }: SearchHUDProps) => {
  const [value, setValue] = useState("");

  const canSubmit = value.trim() && profession;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-paper/60 backdrop-blur-xl p-12 rounded-none border-[1px] border-ink/10 shadow-2xl pointer-events-auto w-full max-w-3xl relative overflow-hidden"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald/30" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald/30" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald/30" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald/30" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-ink text-sm font-bold tracking-[0.3em] uppercase opacity-80 mb-1">
                Urban Signal Analysis
              </h2>
              <p className="text-[9px] text-ink/40 uppercase tracking-[0.2em]">
                Select perspective & describe disruption
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${profession ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
              <div className={`w-2 h-2 rounded-full ${value.trim() ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
            </div>
          </div>

          {/* Profession Selector */}
          <div className="mb-10">
            <ProfessionSelector active={profession} onChange={onProfessionChange} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[1px] bg-ink/5" />
            <span className="text-[8px] tracking-[0.3em] uppercase text-ink/20">Then</span>
            <div className="flex-1 h-[1px] bg-ink/5" />
          </div>

          {/* Signal Input */}
          <div className="relative group/input">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-[1px] bg-emerald/30" />
              <span className="text-[8px] tracking-[0.25em] uppercase font-medium text-ink/40">
                Describe the Signal
              </span>
            </div>

            <input
              className={`
                w-full bg-transparent border-b py-5 text-xl text-ink
                placeholder:opacity-20 placeholder:text-ink
                outline-none transition-all font-light tracking-wide
                ${profession ? 'border-ink/20 focus:border-emerald' : 'border-ink/10 cursor-not-allowed'}
              `}
              placeholder={profession ? "Rain starting in 10ème..." : "Select a profession first..."}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!profession}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) {
                  onSimulate(value);
                }
              }}
            />

            {profession && (
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-emerald"
                initial={{ width: 0 }}
                animate={{ width: value ? `${Math.min(value.length * 3, 100)}%` : "0%" }}
                transition={{ duration: 0.3 }}
              />
            )}

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
              <span className={`text-[10px] tracking-micro uppercase font-bold ${canSubmit ? 'text-emerald' : 'opacity-20'}`}>
                [ Enter ]
              </span>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${profession ? 'bg-emerald' : 'bg-ink/20'}`} />
                <span className="text-[8px] uppercase tracking-micro text-ink/30">Lens</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${value.trim() ? 'bg-emerald' : 'bg-ink/20'}`} />
                <span className="text-[8px] uppercase tracking-micro text-ink/30">Signal</span>
              </div>
            </div>

            {canSubmit && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSimulate(value)}
                className="group flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 hover:bg-emerald hover:text-paper transition-all"
              >
                <span className="text-[9px] tracking-[0.15em] uppercase font-medium text-emerald group-hover:text-paper">
                  Analyze
                </span>
                <span className="text-emerald group-hover:text-paper">→</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Subtle scan effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-[30%] bg-gradient-to-b from-transparent via-emerald/10 to-transparent animate-scan" />
        </div>
      </motion.div>
    </div>
  );
};
