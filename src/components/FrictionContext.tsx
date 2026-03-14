"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FRICTION_REPORTS } from '@/lib/friction-data';

interface FrictionContextProps {
  context: string;
  onContextChange: (context: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const FrictionContext = ({ context, onContextChange, isExpanded, onToggle }: FrictionContextProps) => {
  const hasContext = context.trim().length > 0;
  const previewText = context.slice(0, 100);

  const loadPreset = (key: string) => {
    const report = FRICTION_REPORTS[key as keyof typeof FRICTION_REPORTS];
    if (report) {
      onContextChange(report.data);
    }
  };

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
            <div className="pt-4 space-y-4">
              {/* Quick Load */}
              <div>
                <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
                  <span>Quick Load</span>
                  <div className="flex-1 h-[1px] bg-ink/5" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(FRICTION_REPORTS).map(([key, report]) => (
                    <button
                      key={key}
                      onClick={() => loadPreset(key)}
                      className={`
                        px-3 py-1.5 border text-[8px] tracking-wider uppercase transition-all
                        ${context === report.data
                          ? 'bg-emerald text-paper border-emerald'
                          : 'bg-transparent text-ink/50 border-ink/10 hover:border-emerald/40 hover:text-ink/80'
                        }
                      `}
                    >
                      <div className="font-bold">{report.label}</div>
                      <div className="text-[7px] opacity-70 mt-0.5">{report.summary}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Input */}
              <div>
                <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
                  <span>Or paste custom data</span>
                  <div className="flex-1 h-[1px] bg-ink/5" />
                </div>

                <textarea
                  value={context}
                  onChange={(e) => onContextChange(e.target.value)}
                  placeholder="Paste friction report from Gemini Deep Research..."
                  className="w-full h-28 bg-ink/[0.02] border border-ink/10 p-3 text-[10px] text-ink/70 placeholder:text-ink/20 resize-none focus:outline-none focus:border-emerald/30 transition-colors font-mono"
                />
              </div>

              {hasContext && (
                <div className="flex items-center justify-between pt-2 border-t border-ink/5">
                  <span className="text-[8px] text-emerald/60 uppercase tracking-wider">
                    {context.split('\n').filter(l => l.trim()).length} lines loaded
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
        <div className="mt-2 text-[9px] text-ink/30 truncate font-mono">
          {previewText}...
        </div>
      )}
    </div>
  );
};
