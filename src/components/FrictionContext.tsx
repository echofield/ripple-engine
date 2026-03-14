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

  const loadBothTiers = () => {
    const realtime = Object.values(FRICTION_REPORTS).find(r => r.tier === 'realtime');
    const structural = Object.values(FRICTION_REPORTS).find(r => r.tier === 'structural');
    if (realtime && structural) {
      const combined = `${realtime.data}\n\n${'═'.repeat(67)}\n${'═'.repeat(67)}\n\n${structural.data}`;
      onContextChange(combined);
    }
  };

  const hasBothLoaded = context.includes('URBAN FRICTION REPORT') && context.includes('STRUCTURAL BASELINE');

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
              {/* Two-Tier System */}
              <div className="space-y-4">
                {/* Real-Time Friction */}
                <div>
                  <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
                    <span className="text-amber-500">⚡ Real-Time Friction</span>
                    <div className="flex-1 h-[1px] bg-amber-500/20" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(FRICTION_REPORTS)
                      .filter(([, report]) => report.tier === 'realtime')
                      .map(([key, report]) => (
                      <button
                        key={key}
                        onClick={() => loadPreset(key)}
                        className={`
                          px-3 py-1.5 border text-[8px] tracking-wider uppercase transition-all
                          ${context === report.data
                            ? 'bg-amber-500 text-paper border-amber-500'
                            : 'bg-transparent text-ink/50 border-amber-500/20 hover:border-amber-500/50 hover:text-ink/80'
                          }
                        `}
                      >
                        <div className="font-bold">{report.label}</div>
                        <div className="text-[7px] opacity-70 mt-0.5">{report.summary}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structural Baselines */}
                <div>
                  <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
                    <span className="text-blue-500">◈ Structural Baselines</span>
                    <div className="flex-1 h-[1px] bg-blue-500/20" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(FRICTION_REPORTS)
                      .filter(([, report]) => report.tier === 'structural')
                      .map(([key, report]) => (
                      <button
                        key={key}
                        onClick={() => loadPreset(key)}
                        className={`
                          px-3 py-1.5 border text-[8px] tracking-wider uppercase transition-all
                          ${context === report.data
                            ? 'bg-blue-500 text-paper border-blue-500'
                            : 'bg-transparent text-ink/50 border-blue-500/20 hover:border-blue-500/50 hover:text-ink/80'
                          }
                        `}
                      >
                        <div className="font-bold">{report.label}</div>
                        <div className="text-[7px] opacity-70 mt-0.5">{report.summary}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Scale Fusion */}
                <div>
                  <div className="flex items-center gap-2 text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-2">
                    <span className="text-emerald">⬡ Multi-Scale Fusion</span>
                    <div className="flex-1 h-[1px] bg-emerald/20" />
                  </div>
                  <button
                    onClick={loadBothTiers}
                    className={`
                      w-full px-4 py-2 border text-[9px] tracking-wider uppercase transition-all
                      ${hasBothLoaded
                        ? 'bg-emerald text-paper border-emerald'
                        : 'bg-emerald/5 text-emerald/80 border-emerald/30 hover:bg-emerald/10 hover:border-emerald/50'
                      }
                    `}
                  >
                    <div className="font-bold">Load Full Digital Twin</div>
                    <div className="text-[7px] opacity-70 mt-0.5">
                      Real-time friction + Structural baselines = Multi-scale causal analysis
                    </div>
                  </button>
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
