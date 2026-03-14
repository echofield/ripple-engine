"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapEngine } from '@/components/MapEngine';
import { SearchHUD } from '@/components/SearchHUD';
import { TelemetryStream } from '@/components/TelemetryStream';
import { CausalAncestry } from '@/components/CausalAncestry';
import { FlowDynamics } from '@/components/FlowDynamics';
import { SovereignDecision } from '@/components/SovereignDecision';
import { MacroTicker } from '@/components/MacroTicker';
import type { RippleNode } from '@/types';

interface CausalNode {
  node: string;
  type: 'trigger' | 'amplifier' | 'outcome';
  value: string;
  leads_to: string | null;
}

interface FlowData {
  primary_flow: string;
  secondary_flow: string;
  choke_points: string[];
}

interface FieldState {
  friction_index: number;
  density_pressure: string;
  summary: string;
}

interface MacroStrain {
  index: number;
  primary_factor: string;
}

interface SovereignDecisionData {
  action: string;
  target: string;
  logic: string;
  confidence: number;
}

interface OptimalPosition {
  lat: number;
  lng: number;
  reason: string;
}

export default function Home() {
  const [profession, setProfession] = useState<string | null>(null);
  const [frictionContext, setFrictionContext] = useState<string>('');
  const [ripples, setRipples] = useState<RippleNode[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [mode, setMode] = useState<string>('predictive');
  const [hudVisible, setHudVisible] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSignal, setCurrentSignal] = useState<string>('');

  // Causal Pipeline State
  const [causalChain, setCausalChain] = useState<CausalNode[]>([]);
  const [flowDynamics, setFlowDynamics] = useState<FlowData | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [macroStrain, setMacroStrain] = useState<MacroStrain | null>(null);
  const [sovereignDecision, setSovereignDecision] = useState<SovereignDecisionData | null>(null);
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
        setRipples(data.ripples || []);
        setSources(data.sources || []);
        setMode(data._mode || 'predictive');
        setCausalChain(data.causal_chain || []);
        setFlowDynamics(data.flow_dynamics || null);
        setFieldState(data.field_state || null);
        setMacroStrain(data.macro_strain || null);
        setSovereignDecision(data.sovereign_decision || null);
        setOptimalPosition(data.optimal_position || null);
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
    setRipples([]);
    setSources([]);
    setHudVisible(true);
    setError(null);
    setCurrentSignal('');
    setCausalChain([]);
    setFlowDynamics(null);
    setFieldState(null);
    setMacroStrain(null);
    setSovereignDecision(null);
    setOptimalPosition(null);
  };

  const hasResults = sovereignDecision || causalChain.length > 0;

  return (
    <main className="relative min-h-screen bg-paper text-ink overflow-hidden selection:bg-emerald/20">
      <MapEngine ripples={ripples} />

      {/* Header - MacroTicker */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-paper/80 backdrop-blur-sm border-b border-ink/5">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-[1px] bg-emerald/40" />
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink/40">
              Ripple Engine
            </div>
            <div className="text-[8px] tracking-wider text-ink/20 font-mono">v1.0</div>
            {frictionContext && (
              <div className="px-2 py-0.5 bg-emerald/10 border border-emerald/20 text-[7px] tracking-wider uppercase text-emerald font-bold">
                Digital Twin Active
              </div>
            )}
          </div>

          <MacroTicker
            macroStrain={macroStrain || undefined}
            fieldState={fieldState || undefined}
            isActive={hasResults && !hudVisible}
          />
        </div>
      </div>

      {/* Active Lens Badge */}
      <AnimatePresence>
        {profession && !hudVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-8 z-[60] flex items-center gap-3"
          >
            <span className="text-[8px] tracking-[0.2em] uppercase text-ink/30">Lens</span>
            <div className="px-3 py-1 bg-emerald/10 border border-emerald/20 text-emerald text-[9px] tracking-[0.15em] uppercase font-medium">
              {profession.replace('_', ' ')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telemetry Stream - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-[60] w-56 pointer-events-none opacity-50">
        <TelemetryStream />
      </div>

      {/* Footer */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-2 pointer-events-none">
        <div className="text-[9px] tracking-micro uppercase font-bold text-ink/30">
          {mode === 'grounded' ? 'Grounded Analysis' : 'Predictive Mode'}
        </div>
        <div className="text-[9px] tracking-micro uppercase font-bold text-ink/20">
          Causal Pipeline v1.0
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
      {isCalculating && !hudVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 border border-emerald/20" />
              <div className="absolute inset-0 w-24 h-24 border-2 border-transparent border-t-emerald animate-spin" />
              <div className="absolute inset-3 w-18 h-18 border border-emerald/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono text-emerald/60">CALC</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[11px] tracking-[0.25em] uppercase font-bold text-emerald mb-2">
                Computing Causal Pipeline
              </div>
              <div className="text-[9px] tracking-[0.15em] uppercase text-ink/40">
                Signal → Field → Flow → Ripple
              </div>
              <div className="mt-3 text-[8px] tracking-wider uppercase text-ink/30">
                {profession?.replace('_', ' ')} Lens Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAUSAL PIPELINE Results Panel */}
      <AnimatePresence>
        {hasResults && !hudVisible && !isCalculating && (
          <motion.div
            initial={{ x: -480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -480, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed inset-y-0 left-0 z-50 flex h-screen w-[480px] pointer-events-none"
          >
            <div className="w-full h-full pt-20 pb-8 px-8 flex flex-col bg-paper/90 backdrop-blur-2xl border-r border-ink/10 pointer-events-auto relative shadow-2xl overflow-hidden">

              {/* Watermark */}
              <div className="absolute top-16 right-4 opacity-[0.02]">
                <div className="text-[80px] font-black tracking-tighter leading-none">
                  FLOW
                </div>
              </div>

              {/* Mode Badge */}
              {mode === 'grounded' && (
                <div className="absolute top-20 right-6 px-2 py-1 bg-emerald/10 border border-emerald/20">
                  <span className="text-[7px] tracking-[0.2em] uppercase text-emerald font-bold">Grounded</span>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald animate-pulse" />
                  <h1 className="font-black text-sm tracking-[0.25em] uppercase text-ink">
                    Causal Pipeline
                  </h1>
                </div>
                <p className="text-[8px] text-ink/30 uppercase tracking-[0.2em] ml-5">
                  Signal → Field → Flow → Ripple
                </p>
              </div>

              {/* Signal Echo - Layer 01 */}
              <div className="mb-4 p-3 bg-ink/[0.02] border-l-2 border-ink/20">
                <div className="text-[7px] tracking-[0.15em] uppercase text-ink/30 mb-1">
                  Layer 01 // Signal
                </div>
                <p className="text-[11px] text-ink/70 italic leading-relaxed">&ldquo;{currentSignal}&rdquo;</p>
              </div>

              {/* Reset */}
              <button
                className="group flex items-center gap-3 text-[9px] tracking-[0.15em] uppercase text-ink/40 hover:text-emerald transition-colors font-bold mb-4"
                onClick={resetEngine}
              >
                <span className="w-4 h-[1px] bg-ink/20 group-hover:bg-emerald group-hover:w-6 transition-all" />
                New Simulation
              </button>

              {/* SOVEREIGN DECISION - The Bold Box */}
              {sovereignDecision && (
                <div className="mb-4">
                  <SovereignDecision decision={sovereignDecision} profession={profession || ''} />
                </div>
              )}

              {/* Scrollable Pipeline Content */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">

                {/* Layer 02 - Field State */}
                {fieldState && (
                  <div className="p-3 bg-ink/[0.02] border-l-2 border-amber-500/30">
                    <div className="text-[7px] tracking-[0.15em] uppercase text-amber-500/60 mb-2">
                      Layer 02 // Field State
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-ink/40">Friction:</span>
                        <span className="font-mono text-[10px] font-bold text-amber-500">
                          {fieldState.friction_index.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-ink/40">Density:</span>
                        <span className={`text-[9px] uppercase font-bold ${
                          fieldState.density_pressure === 'critical' ? 'text-red-400' : 'text-ink/60'
                        }`}>
                          {fieldState.density_pressure}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-ink/60 leading-relaxed">{fieldState.summary}</p>
                  </div>
                )}

                {/* Layer 03 - Flow Dynamics */}
                {flowDynamics && (
                  <FlowDynamics flow={flowDynamics} />
                )}

                {/* Layer 04 - Causal Chain */}
                {causalChain.length > 0 && (
                  <div className="pt-2">
                    <CausalAncestry chain={causalChain} profession={profession || ''} />
                  </div>
                )}

                {/* Optimal Position */}
                {optimalPosition && (
                  <div className="p-3 bg-emerald/5 border border-emerald/20 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald animate-pulse" />
                      <span className="text-[8px] tracking-[0.15em] uppercase text-emerald font-bold">
                        Optimal Coordinates
                      </span>
                    </div>
                    <div className="text-[10px] text-ink/70 mb-2">{optimalPosition.reason}</div>
                    <div className="font-mono text-[9px] text-emerald/70 bg-emerald/10 px-2 py-1 inline-block">
                      {optimalPosition.lat.toFixed(4)}, {optimalPosition.lng.toFixed(4)}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {sources.length > 0 && (
                  <div className="pt-4 border-t border-ink/5">
                    <div className="text-[7px] tracking-[0.15em] uppercase text-ink/20 mb-2">Data Sources</div>
                    <div className="flex flex-wrap gap-1">
                      {sources.map((src, i) => (
                        <span key={i} className="text-[7px] px-1.5 py-0.5 bg-ink/[0.02] border border-ink/5 text-ink/30">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-ink/5 flex items-center justify-between">
                <div className="text-[8px] uppercase tracking-widest text-ink/20 font-bold">
                  {ripples.length} Ripple Vectors
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1.5 h-1.5 ${i <= Math.min(ripples.length, 5) ? 'bg-emerald' : 'bg-ink/10'}`} />
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
