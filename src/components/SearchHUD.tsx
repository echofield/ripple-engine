"use client";
import { motion } from 'framer-motion';
import { useState } from 'react';

export const SearchHUD = ({ onSimulate }: { onSimulate: (signal: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-paper/40 backdrop-blur-xl p-12 rounded-none border-[1px] border-ink/10 shadow-2xl pointer-events-auto w-full max-w-3xl relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald/40" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald/40" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald/40" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald/40" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-ink text-sm font-bold tracking-[0.3em] uppercase opacity-80">
              System Ready // Signal Input Required
            </h2>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-ink/10" />
            </div>
          </div>

          <p className="text-ink/60 text-xs mb-10 tracking-widest uppercase leading-relaxed max-w-md">
            The Ripple Causal Kernel processes urban signals to map Intent, Action, and Ramification. Describe a disruption to begin calculation.
          </p>

          <div className="relative group/input">
            <input
              autoFocus
              className="w-full bg-transparent border-b border-ink/20 py-6 text-2xl text-ink placeholder:opacity-10 placeholder:text-ink focus:border-emerald outline-none transition-all font-light tracking-wide"
              placeholder="ENTER URBAN SIGNAL..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                   onSimulate(value);
                }
              }}
            />

            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-emerald"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
               <span className="text-[10px] tracking-micro uppercase opacity-30 font-bold">
                 [ Press Enter ]
               </span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
             <div className="space-y-2">
                <span className="text-[8px] uppercase tracking-micro opacity-40 block">Latent Data Layer</span>
                <div className="h-1 bg-ink/5 w-full rounded-full overflow-hidden">
                   <div className="h-full bg-ink/10 w-[65%]" />
                </div>
             </div>
             <div className="space-y-2">
                <span className="text-[8px] uppercase tracking-micro opacity-40 block">Kernel Synapse Connectivity</span>
                <div className="h-1 bg-ink/5 w-full rounded-full overflow-hidden">
                   <div className="h-full bg-emerald/40 w-[92%]" />
                </div>
             </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
           <div className="w-full h-[50%] bg-gradient-to-b from-transparent via-emerald/5 to-transparent animate-scan" />
        </div>
      </motion.div>
    </div>
  );
};
