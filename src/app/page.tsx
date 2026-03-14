"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapEngine } from '@/components/MapEngine';
import { SearchHUD } from '@/components/SearchHUD';
import { TelemetryStream } from '@/components/TelemetryStream';
import { CausalAncestry } from '@/components/CausalAncestry';
import { DifferenceEngine } from '@/components/DifferenceEngine';
import type { IRATrace, RippleNode } from '@/types';

interface CausalNode {
  node: string;
  type: 'trigger' | 'amplifier' | 'outcome';
  value: string;
  leads_to: string | null;
}

interface DeltaData {
  status_quo: string;
  post_signal: string;
  change_percent: number;
  risk_level: number;
}

interface OptimalPosition {
  lat: number;
  lng: number;
  reason: string;
}

export default function Home() {
  const [profession, setProfession] = useState<string | null>(null);
  const [frictionContext, setFrictionContext] = useState<string>('');
  const [trace, setTrace] = useState<IRATrace | null>(null);
  const [ripples, setRipples] = useState<RippleNode[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [mode, setMode] = useState<string>('predictive');
  const [hudVisible, setHudVisible] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<string>('');
  const [causalChain, setCausalChain] = useState<CausalNode[]>([]);
  const [delta, setDelta] = useState<DeltaData | null>(null);
  const [optimalPosition, setOptimalPosition] = useState<OptimalPosition | null>(null);

  const triggerSimulation = async (signal: string) => {
    if (!signal.trim() || !profession) return;

    setCurrentSignal(signal);
    setIsCalculating(true);
    setHudVisible(false);
    setError(null);

    try {
      const res = await fetch('/api/simulate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal,
          profession,
          frictionContext: frictionContext.trim() || undefined
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();

      setTimeout(() => {
        setTrace(data.ira_trace);
        setRipples(data.ripples || []);
        setSources(data.sources || []);
        setMode(data._mode || 'predictive');
        setCausalChain(data.causal_chain || []);
        setDelta(data.delta || null);
        setOptimalPosition(data.optimal_position || null);
        setIsCalculating(false);
      }, 1200);

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
    setSources([]);
    setHudVisible(true);
    setError(null);
    setCurrentSignal('');
    setCausalChain([]);
    setDelta(null);
    setOptimalPosition(null);
  };

  return (
    <main className="relative min-h-screen bg-paper text-ink overflow-hidden selection:bg-emerald/20">
      <MapEngine ripples={ripples} />

      {/* Header */}
      <div className="fixed top-8 left-8 z-[60] flex items-center gap-4 pointer-events-none">
        <div className="w-10 h-[1px] bg-emerald/40" />
        <div className="text-[10px] tracking-[0.4em] uppercase font-bold text-ink opacity-40">
          Ripple Causal Kernel // 0.5.0
        </div>
        {frictionContext && (
          <div className="px-2 py-0.5 bg-emerald/10 border border-emerald/20 text-[8px] tracking-wider uppercase text-emerald">
            Grounded
          </div>
        )}
      </div>

      {/* Active Lens Badge */}
      <AnimatePresence>
        {profession && !hudVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-8 right-8 z-[60] flex items-center gap-3"
          >
            <span className="text-[8px] tracking-[0.2em] uppercase text-ink/30">Lens</span>
            <div className="px-3 py-1 bg-emerald/10 border border-emerald/20 text-emerald text-[9px] tracking-[0.15em] uppercase font-medium">
              {profession.replace('_', ' ')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry Stream - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-[60] w-56 pointer-events-none opacity-60">
        <TelemetryStream />
      </div>

      {/* Footer */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-2 pointer-events-none">
        <div className="text-[9px] tracking-micro uppercase font-bold text-ink/30">
          {mode === 'grounded' ? 'Mode: Grounded Data' : 'Mode: Predictive'}
        </div>
        <div className="text-[9px] tracking-micro uppercase font-bold text-ink/30">
          Engine: Gemini-IRA v0.5
        </div>
        <div className="w-24 h-[1px] bg-ink/10 mt-2" />
      </div>

      {/* Error Toast */}
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

      {/* Main HUD */}
      <AnimatePresence>
        {hudVisible && (
          <SearchHUD
            onSimulate={triggerSimulation}
            profession={profession}
            onProfessionChange={setProfession}
            frictionContext={frictionContext}
            onFrictionContextChange={setFrictionContext}
            isProcessing={isCalculating}
          />
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isCalculating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border border-emerald/20 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-2 border-transparent border-t-emerald rounded-full animate-spin" />
              <div className="absolute inset-2 w-16 h-16 border border-emerald/10 rounded-full" />
            </div>
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-emerald animate-pulse mb-2">
                {frictionContext ? 'Grounding Analysis' : 'Calculating Ripples'}
              </div>
              <div className="text-[8px] tracking-[0.2em] uppercase text-ink/30">
                {profession?.replace('_', ' ')} Perspective
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Panel */}
      <AnimatePresence>
        {trace && !hudVisible && !isCalculating && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed inset-y-0 left-0 z-50 flex h-screen w-[440px] pointer-events-none"
          >
            <div className="w-full h-full p-10 flex flex-col bg-paper/80 backdrop-blur-2xl border-r border-ink/5 pointer-events-auto relative shadow-2xl overflow-hidden">

              {/* Decorative */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <div className="text-[60px] font-bold tracking-tight">IRA</div>
              </div>

              {/* Mode Badge */}
              {mode === 'grounded' && (
                <div className="absolute top-6 right-6 px-2 py-1 bg-emerald/10 border border-emerald/20">
                  <span className="text-[7px] tracking-[0.2em] uppercase text-emerald font-bold">Grounded</span>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" />
                  <h1 className="font-bold text-xs tracking-[0.3em] uppercase text-emerald">
                    Causal Analysis
                  </h1>
                </div>
                <p className="text-[9px] text-ink/30 uppercase tracking-widest ml-5">
                  {profession?.replace('_', ' ')} • {mode === 'grounded' ? 'Real Data' : 'Predictive'}
                </p>
              </div>

              {/* Signal Echo */}
              <div className="mb-6 p-4 bg-ink/[0.02] border border-ink/5">
                <span className="text-[8px] tracking-[0.2em] uppercase text-ink/30 block mb-2">Signal</span>
                <p className="text-sm text-ink/70 italic">&ldquo;{currentSignal}&rdquo;</p>
              </div>

              {/* Reset */}
              <button
                className="group flex items-center gap-3 text-[10px] tracking-micro uppercase text-ink/40 hover:text-emerald transition-colors font-bold mb-6"
                onClick={resetEngine}
              >
                <span className="w-4 h-[1px] bg-ink/20 group-hover:bg-emerald group-hover:w-6 transition-all" />
                New Analysis
              </button>

              {/* IRA Trace */}
              <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Causal Ancestry - The "Why" Chain */}
                {causalChain.length > 0 && (
                  <section className="pb-4 border-b border-ink/10">
                    <CausalAncestry chain={causalChain} profession={profession || ''} />
                  </section>
                )}

                {/* Difference Engine - Delta Display */}
                {delta && (
                  <section className="pb-4 border-b border-ink/10">
                    <DifferenceEngine delta={delta} profession={profession || ''} />
                  </section>
                )}

                {/* Optimal Position */}
                {optimalPosition && (
                  <section className="p-3 bg-emerald/5 border border-emerald/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald animate-pulse rounded-full" />
                      <span className="text-[8px] tracking-[0.15em] uppercase text-emerald font-bold">
                        Optimal Position
                      </span>
                    </div>
                    <div className="text-[10px] text-ink/70 mb-1">{optimalPosition.reason}</div>
                    <div className="font-mono text-[8px] text-emerald/60">
                      LAT: {optimalPosition.lat.toFixed(4)} | LNG: {optimalPosition.lng.toFixed(4)}
                    </div>
                  </section>
                )}

                {/* IRA Framework Analysis */}
                <section>
                  <div className="flex items-center gap-2 mb-3 text-[8px] tracking-[0.15em] uppercase text-ink/30">
                    <span>IRA Framework</span>
                    <div className="flex-1 h-[1px] bg-ink/10" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-5 h-5 flex items-center justify-center border border-ink/10 text-[8px] font-black text-ink/30">I</span>
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink font-bold">Intent</h2>
                      </div>
                      <div className="ml-8 p-3 bg-ink/[0.02] border-l-2 border-ink/10 text-xs leading-relaxed text-ink/70">
                        {trace.intent}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-5 h-5 flex items-center justify-center border border-ink/10 text-[8px] font-black text-ink/30">A</span>
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-ink font-bold">Action</h2>
                      </div>
                      <div className="ml-8 p-3 bg-ink/[0.02] border-l-2 border-ink/10 text-xs leading-relaxed text-ink/70">
                        {trace.action}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-5 h-5 flex items-center justify-center border border-emerald/20 bg-emerald/5 text-[8px] font-black text-emerald">R</span>
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-emerald font-bold">Ramification</h2>
                      </div>
                      <div className="ml-8 p-3 bg-emerald/[0.03] border-l-2 border-emerald/30 text-xs leading-relaxed text-emerald/90 font-medium">
                        {trace.ramification}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sources */}
                {sources.length > 0 && (
                  <section className="pt-4 border-t border-ink/5">
                    <div className="text-[8px] tracking-[0.2em] uppercase text-ink/30 mb-2">Data Sources</div>
                    <div className="flex flex-wrap gap-1">
                      {sources.map((src, i) => (
                        <span key={i} className="text-[8px] px-2 py-0.5 bg-ink/[0.03] border border-ink/5 text-ink/40">
                          {src}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-ink/5 flex items-center justify-between">
                <div className="text-[8px] uppercase tracking-widest opacity-20 font-bold">
                  {ripples.length} Ripples Mapped
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-1 ${i <= Math.min(ripples.length, 5) ? 'bg-emerald' : 'bg-ink/10'}`} />
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
