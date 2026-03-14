"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapEngine } from '@/components/MapEngine';
import { SearchHUD } from '@/components/SearchHUD';
import type { IRATrace, RippleNode, SimulationResponse } from '@/types';

export default function Home() {
  const [trace, setTrace] = useState<IRATrace | null>(null);
  const [ripples, setRipples] = useState<RippleNode[]>([]);
  const [hudVisible, setHudVisible] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerSimulation = async (signal: string) => {
    if (!signal.trim()) return;

    setIsCalculating(true);
    setHudVisible(false);
    setError(null);

    try {
      const res = await fetch('/api/simulate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: SimulationResponse = await res.json();

      setTimeout(() => {
        setTrace(data.ira_trace);
        setRipples(data.ripples);
        setIsCalculating(false);
      }, 1500);

    } catch (err) {
      console.error('Simulation failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setHudVisible(true);
      setIsCalculating(false);
    }
  };

  const resetEngine = () => {
    setTrace(null);
    setRipples([]);
    setHudVisible(true);
    setError(null);
  };

  return (
    <main className="relative min-h-screen bg-paper text-ink overflow-hidden selection:bg-emerald/20">
      <MapEngine ripples={ripples} />

      <div className="fixed top-8 left-8 z-[60] flex items-center gap-4 pointer-events-none">
         <div className="w-10 h-[1px] bg-emerald/40" />
         <div className="text-[10px] tracking-[0.4em] uppercase font-bold text-ink opacity-40">
           Ripple Causal Kernel // 0.3.2
         </div>
      </div>

      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-2 pointer-events-none">
         <div className="text-[9px] tracking-micro uppercase font-bold text-ink/30">
           Coord Source: Mapbox-GL-Light
         </div>
         <div className="text-[9px] tracking-micro uppercase font-bold text-ink/30">
           Engine: Gemini-IRA-Active
         </div>
         <div className="w-24 h-[1px] bg-ink/10 mt-2" />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-red-500/10 border border-red-500/20 px-6 py-3 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-red-600">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="text-red-500/60 hover:text-red-500 text-xs ml-2"
              >
                x
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hudVisible && !isCalculating && (
          <SearchHUD onSimulate={triggerSimulation} />
        )}
      </AnimatePresence>

      {isCalculating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/20 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-2 border-emerald/20 border-t-emerald rounded-full animate-spin" />
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-emerald animate-pulse">
                Calculating Causal Ripples...
              </div>
           </div>
        </div>
      )}

      <AnimatePresence>
        {trace && !hudVisible && !isCalculating && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed inset-y-0 left-0 z-50 flex h-screen w-[420px] pointer-events-none"
          >
            <div className="w-full h-full p-10 flex flex-col bg-paper/60 backdrop-blur-2xl border-r border-ink/5 pointer-events-auto relative shadow-2xl">

              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <div className="text-[40px] font-bold">IRA</div>
              </div>

              <div className="flex flex-col gap-1 mb-12">
                <h1 className="font-bold text-xs tracking-[0.3em] uppercase text-emerald">Causal Trace Results</h1>
                <p className="text-[9px] text-ink/30 uppercase tracking-widest">Temporal Analysis Layer 01</p>
              </div>

              <button
                 className="group flex items-center gap-3 text-[10px] tracking-micro uppercase text-ink/40 hover:text-ink transition-colors font-bold mb-12"
                 onClick={resetEngine}
              >
                <span className="w-4 h-[1px] bg-ink/20 group-hover:bg-ink group-hover:w-6 transition-all" />
                Reset Engine
              </button>

              <div className="flex-1 space-y-12 overflow-y-auto">
                <section>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-ink/20">01</span>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink font-bold border-b border-ink/5 flex-1 pb-1">Intent (I)</h2>
                  </div>
                  <div className="bg-ink/[0.02] border border-ink/5 p-5 rounded-none text-xs leading-relaxed text-ink/70 font-medium">
                    {trace.intent}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-ink/20">02</span>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink font-bold border-b border-ink/5 flex-1 pb-1">Action (A)</h2>
                  </div>
                  <div className="bg-ink/[0.02] border border-ink/5 p-5 rounded-none text-xs leading-relaxed text-ink/70">
                    {trace.action}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-ink/20">03</span>
                    <h2 className="text-[10px] uppercase tracking-[0.2em] text-emerald font-bold border-b border-emerald/10 flex-1 pb-1">Ramification (R)</h2>
                  </div>
                  <div className="bg-emerald/[0.03] border border-emerald/10 p-5 rounded-none text-xs leading-relaxed text-emerald font-bold italic">
                    {trace.ramification}
                  </div>
                </section>
              </div>

              <div className="mt-auto pt-8 border-t border-ink/5 flex items-center justify-between">
                 <div className="text-[8px] uppercase tracking-widest opacity-20 font-bold">
                    Spatial Confidence: 0.984
                 </div>
                 <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className={`w-1 h-1 ${i < 4 ? 'bg-emerald' : 'bg-ink/10'}`} />
                    ))}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
