"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { FRICTION_REPORTS } from '@/lib/friction-data';

interface DataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  onContextChange: (c: string) => void;
}

export const DataDrawer = ({ isOpen, onClose, context, onContextChange }: DataDrawerProps) => {
  const loadPreset = (key: string) => {
    const report = FRICTION_REPORTS[key as keyof typeof FRICTION_REPORTS];
    if (report) onContextChange(report.data);
  };

  const loadBoth = () => {
    const all = Object.values(FRICTION_REPORTS).map(r => r.data).join('\n\n');
    onContextChange(all);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/10 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-80 bg-paper border-l border-ink/10 shadow-2xl z-[101] p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase font-bold text-ink/60">
                Data Configuration
              </h2>
              <button
                onClick={onClose}
                className="text-ink/30 hover:text-ink text-lg"
              >
                ×
              </button>
            </div>

            {/* Quick Load */}
            <div className="space-y-3 mb-6">
              <div className="text-[8px] tracking-wider uppercase text-ink/30">
                Quick Load
              </div>

              {Object.entries(FRICTION_REPORTS).map(([key, report]) => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`
                    w-full text-left p-3 border transition-all
                    ${context === report.data
                      ? 'bg-emerald/10 border-emerald/30 text-emerald'
                      : 'bg-ink/[0.02] border-ink/10 text-ink/60 hover:border-ink/20'
                    }
                  `}
                >
                  <div className="text-[9px] font-bold tracking-wider uppercase">{report.label}</div>
                  <div className="text-[8px] opacity-60 mt-0.5">{report.summary}</div>
                </button>
              ))}

              <button
                onClick={loadBoth}
                className="w-full p-3 bg-emerald/5 border border-emerald/20 text-emerald text-[9px] tracking-wider uppercase font-bold hover:bg-emerald/10 transition-colors"
              >
                Load Full Digital Twin
              </button>
            </div>

            {/* Status */}
            {context && (
              <div className="p-3 bg-emerald/5 border border-emerald/20 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-emerald uppercase tracking-wider">
                    {context.split('\n').filter(l => l.trim()).length} lines loaded
                  </span>
                  <button
                    onClick={() => onContextChange('')}
                    className="text-[8px] text-red-400 hover:text-red-500 uppercase"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Custom paste */}
            <details className="group">
              <summary className="text-[8px] tracking-wider uppercase text-ink/30 cursor-pointer hover:text-ink/50 mb-2">
                Custom Data Paste
              </summary>
              <textarea
                value={context}
                onChange={(e) => onContextChange(e.target.value)}
                placeholder="Paste friction report..."
                className="w-full h-32 bg-ink/[0.02] border border-ink/10 p-2 text-[9px] font-mono text-ink/60 resize-none outline-none focus:border-emerald/30"
              />
            </details>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
