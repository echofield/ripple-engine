"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapEngine } from '@/components/MapEngine';
import { CommandBar } from '@/components/CommandBar';
import { DataDrawer } from '@/components/DataDrawer';
import { SovereignDecision } from '@/components/SovereignDecision';
import { FlowDynamics } from '@/components/FlowDynamics';
import { CausalAncestry } from '@/components/CausalAncestry';
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
  const [mode, setMode] = useState<string>('predictive');
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentSignal, setCurrentSignal] = useState<string>('');
  const [showDataDrawer, setShowDataDrawer] = useState(false);

  // Results
  const [causalChain, setCausalChain] = useState<CausalNode[]>([]);
  const [flowDynamics, setFlowDynamics] = useState<FlowData | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [macroStrain, setMacroStrain] = useState<MacroStrain | null>(null);
  const [sovereignDecision, setSovereignDecision] = useState<SovereignDecisionData | null>(null);
  const [optimalPosition, setOptimalPosition] = useState<OptimalPosition | null>(null);

  const hasResults = sovereignDecision || causalChain.length > 0;
  const hasData = frictionContext.trim().length > 0;

  const triggerSimulation = async (signal: string) => {
    if (!signal.trim() || !profession) return;

    setCurrentSignal(signal);
    setIsCalculating(true);

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

      const data = await res.json();

      setTimeout(() => {
        setRipples(data.ripples || []);
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
      setIsCalculating(false);
    }
  };

  const resetEngine = () => {
    setRipples([]);
    setCurrentSignal('');
    setCausalChain([]);
    setFlowDynamics(null);
    setFieldState(null);
    setMacroStrain(null);
    setSovereignDecision(null);
    setOptimalPosition(null);
  };

  return (
    <main className="relative w-screen h-screen bg-paper overflow-hidden">
      {/* DOT GRID BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* REGISTRATION MARKS - L Brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-[1px] border-l-[1px] border-ink/[0.08]" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-[1px] border-r-[1px] border-ink/[0.08]" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-[1px] border-l-[1px] border-ink/[0.08]" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-[1px] border-r-[1px] border-ink/[0.08]" />

      {/* 1. THE CANVAS - Map is the hero */}
      <MapEngine ripples={ripples} />

      {/* 2. TOP HUD - Minimal */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-6 pointer-events-none">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-[1px] bg-emerald/40" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-ink/40">
            Ripple Engine
          </span>
          <span className="text-[7px] text-ink/20 font-mono">v1.0</span>
        </div>

        {/* Right side - Macro Strain + Data Config */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Macro Strain Telemetry */}
          {macroStrain && (
            <div className="flex items-center gap-2 font-mono text-[8px]">
              <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse" />
              <span className="text-ink/40">STRAIN:</span>
              <span className="text-amber-500 font-bold">{macroStrain.index.toFixed(2)}</span>
            </div>
          )}

          {/* Data Config Button */}
          <button
            onClick={() => setShowDataDrawer(true)}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-[8px] tracking-wider uppercase transition-all
              ${hasData
                ? 'bg-emerald/10 border border-emerald/30 text-emerald'
                : 'bg-paper/80 border border-ink/10 text-ink/40 hover:text-ink/60'
              }
            `}
          >
            <span>⚙</span>
            <span>Data</span>
            {hasData && <span className="w-1.5 h-1.5 bg-emerald rounded-full" />}
          </button>
        </div>
      </div>

      {/* 3. LEFT PANEL - Results (only after simulation) */}
      <AnimatePresence>
        {hasResults && !isCalculating && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute top-20 left-4 w-[360px] max-h-[calc(100vh-180px)] overflow-y-auto pointer-events-auto"
          >
            <div className="bg-paper/95 backdrop-blur-xl border border-ink/10 shadow-2xl p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald animate-pulse" />
                  <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-ink/60">
                    Causal Pipeline
                  </span>
                </div>
                <button
                  onClick={resetEngine}
                  className="text-[8px] text-ink/30 hover:text-ink/60 uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              {/* Signal */}
              <div className="mb-4 p-2 bg-ink/[0.02] border-l-2 border-ink/10">
                <div className="text-[7px] text-ink/30 uppercase tracking-wider mb-1">Signal</div>
                <div className="text-[10px] text-ink/70 italic">"{currentSignal}"</div>
              </div>

              {/* SOVEREIGN DECISION */}
              {sovereignDecision && (
                <div className="mb-4">
                  <SovereignDecision decision={sovereignDecision} profession={profession || ''} />
                </div>
              )}

              {/* Field State */}
              {fieldState && (
                <div className="mb-3 p-2 bg-ink/[0.02] border-l-2 border-amber-500/30">
                  <div className="text-[7px] text-amber-500/60 uppercase tracking-wider mb-1">Field State</div>
                  <div className="flex gap-3 text-[9px]">
                    <span className="text-ink/40">Friction: <span className="text-amber-500 font-bold">{fieldState.friction_index.toFixed(2)}</span></span>
                    <span className="text-ink/40">Density: <span className="font-bold">{fieldState.density_pressure}</span></span>
                  </div>
                </div>
              )}

              {/* Flow Dynamics */}
              {flowDynamics && (
                <div className="mb-3">
                  <FlowDynamics flow={flowDynamics} />
                </div>
              )}

              {/* Causal Chain */}
              {causalChain.length > 0 && (
                <div className="mb-3">
                  <CausalAncestry chain={causalChain} profession={profession || ''} />
                </div>
              )}

              {/* Optimal Position */}
              {optimalPosition && (
                <div className="p-2 bg-emerald/5 border border-emerald/20">
                  <div className="text-[7px] text-emerald uppercase tracking-wider mb-1">Optimal Position</div>
                  <div className="text-[9px] text-ink/70">{optimalPosition.reason}</div>
                  <div className="font-mono text-[8px] text-emerald/70 mt-1">
                    {optimalPosition.lat.toFixed(4)}, {optimalPosition.lng.toFixed(4)}
                  </div>
                </div>
              )}

              {/* Mode Badge */}
              <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between">
                <span className="text-[7px] text-ink/20 uppercase tracking-wider">
                  {mode === 'grounded' ? 'Grounded Analysis' : 'Predictive Mode'}
                </span>
                <div className="flex gap-1">
                  {ripples.map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-emerald" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. LOADING STATE */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-paper/30 backdrop-blur-sm z-[50]"
          >
            <div className="text-center">
              <div className="w-16 h-16 border border-emerald/30 mb-4 mx-auto relative">
                <div className="absolute inset-0 border-2 border-transparent border-t-emerald animate-spin" />
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-emerald font-bold">
                Computing Pipeline
              </div>
              <div className="text-[8px] tracking-wider uppercase text-ink/30 mt-1">
                Signal → Field → Flow → Ripple
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. BOTTOM COMMAND BAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[40]">
        <CommandBar
          profession={profession}
          onProfessionChange={setProfession}
          onSimulate={triggerSimulation}
          isProcessing={isCalculating}
          hasData={hasData}
        />
      </div>

      {/* 6. BOTTOM TELEMETRY */}
      <div className="absolute bottom-4 left-4 flex gap-4 font-mono text-[7px] text-ink/30 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-emerald animate-pulse rounded-full" />
          <span>Kernel: Online</span>
        </div>
        <span>Pipeline: {hasResults ? 'Active' : 'Standby'}</span>
        <span>IRA: Synchronized</span>
      </div>

      {/* 7. DATA DRAWER */}
      <DataDrawer
        isOpen={showDataDrawer}
        onClose={() => setShowDataDrawer(false)}
        context={frictionContext}
        onContextChange={setFrictionContext}
      />
    </main>
  );
}
