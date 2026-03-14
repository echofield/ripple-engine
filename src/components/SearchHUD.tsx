"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ProfessionSelector } from './ProfessionSelector';
import { FrictionContext } from './FrictionContext';

interface SearchHUDProps {
  onSimulate: (signal: string) => void;
  profession: string | null;
  onProfessionChange: (profession: string) => void;
  frictionContext: string;
  onFrictionContextChange: (context: string) => void;
  isProcessing?: boolean;
}

const PROCESSING_PHASES = [
  'INITIALIZING_KERNEL...',
  'PARSING_FRICTION_DATA...',
  'LOADING_CAUSAL_GRAPH...',
  'RUNNING_IRA_SIMULATION...',
  'CALCULATING_RIPPLE_VECTORS...',
  'MAPPING_OPTIMAL_POSITIONS...',
  'FINALIZING_DELTA_ANALYSIS...',
];

export const SearchHUD = ({
  onSimulate,
  profession,
  onProfessionChange,
  frictionContext,
  onFrictionContextChange,
  isProcessing = false
}: SearchHUDProps) => {
  const [value, setValue] = useState("");
  const [showFriction, setShowFriction] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);

  const canSubmit = value.trim() && profession && !isProcessing;
  const hasContext = frictionContext.trim().length > 0;

  // Cycle through processing phases
  useEffect(() => {
    if (isProcessing) {
      setProcessingPhase(0);
      const interval = setInterval(() => {
        setProcessingPhase(prev => (prev + 1) % PROCESSING_PHASES.length);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-paper/70 backdrop-blur-xl p-10 rounded-none border-[1px] border-ink/10 shadow-2xl pointer-events-auto w-full max-w-3xl relative overflow-hidden"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald/30" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald/30" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald/30" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-ink text-sm font-bold tracking-[0.3em] uppercase opacity-80 mb-1">
                Urban Signal Analysis
              </h2>
              <p className="text-[9px] text-ink/40 uppercase tracking-[0.2em]">
                {hasContext ? 'Grounded Mode • Real Data Active' : 'Predictive Mode'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${profession ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
              <div className={`w-2 h-2 rounded-full ${value.trim() ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
              <div className={`w-2 h-2 rounded-full ${hasContext ? 'bg-emerald animate-pulse' : 'bg-ink/20'}`} />
            </div>
          </div>

          {/* Friction Context (Collapsible) */}
          <div className="p-4 bg-ink/[0.02] border border-ink/5">
            <FrictionContext
              context={frictionContext}
              onContextChange={onFrictionContextChange}
              isExpanded={showFriction}
              onToggle={() => setShowFriction(!showFriction)}
            />
          </div>

          {/* Profession Selector */}
          <ProfessionSelector active={profession} onChange={onProfessionChange} />

          {/* Signal Input */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-[1px] bg-emerald/30" />
              <span className="text-[8px] tracking-[0.25em] uppercase font-medium text-ink/40">
                Describe the Signal
              </span>
            </div>

            <input
              className={`
                w-full bg-transparent border-b py-4 text-lg text-ink
                placeholder:opacity-20 placeholder:text-ink
                outline-none transition-all font-light tracking-wide
                ${profession ? 'border-ink/20 focus:border-emerald' : 'border-ink/10 cursor-not-allowed'}
              `}
              placeholder={profession ? "Rain starting at Gare du Nord..." : "Select a profession first..."}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={!profession}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSubmit) {
                  onSimulate(value);
                }
              }}
            />

            {profession && value && (
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-emerald"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(value.length * 2, 100)}%` }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-emerald"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] text-emerald tracking-wider">
                      {PROCESSING_PHASES[processingPhase]}
                    </span>
                  </div>
                  <div className="mt-2 h-1 bg-ink/10 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald/50"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasContext ? 'bg-emerald' : 'bg-ink/20'}`} />
                    <span className="text-[8px] uppercase tracking-micro text-ink/30">Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${profession ? 'bg-emerald' : 'bg-ink/20'}`} />
                    <span className="text-[8px] uppercase tracking-micro text-ink/30">Lens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${value.trim() ? 'bg-emerald' : 'bg-ink/20'}`} />
                    <span className="text-[8px] uppercase tracking-micro text-ink/30">Signal</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {canSubmit && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSimulate(value)}
                className="group flex items-center gap-3 px-5 py-2.5 bg-emerald text-paper hover:bg-emerald/90 transition-all"
              >
                <span className="text-[9px] tracking-[0.15em] uppercase font-bold">
                  {hasContext ? 'Ground Analysis' : 'Analyze'}
                </span>
                <span className="text-paper/80 group-hover:translate-x-0.5 transition-transform">→</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Scan effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
          <div className="w-full h-[20%] bg-gradient-to-b from-transparent via-emerald/20 to-transparent animate-scan" />
        </div>
      </motion.div>
    </div>
  );
};
