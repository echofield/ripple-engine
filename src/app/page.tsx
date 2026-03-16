"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapEngine } from '@/components/MapEngine';
import { CommandBar, SignalPayload } from '@/components/CommandBar';
import { CollectiveHud } from '@/components/CollectiveHud';
import { DataDrawer } from '@/components/DataDrawer';
import { SovereignDecision } from '@/components/SovereignDecision';
import { FlowDynamics } from '@/components/FlowDynamics';
import { CausalAncestry } from '@/components/CausalAncestry';
import { useKernelAgent } from '@/hooks/useKernelAgent';
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
  const [currentMitigation, setCurrentMitigation] = useState<string | null>(null);
  const [showDataDrawer, setShowDataDrawer] = useState(false);

  const [causalChain, setCausalChain] = useState<CausalNode[]>([]);
  const [flowDynamics, setFlowDynamics] = useState<FlowData | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [macroStrain, setMacroStrain] = useState<MacroStrain | null>(null);
  const [sovereignDecision, setSovereignDecision] = useState<SovereignDecisionData | null>(null);
  const [optimalPosition, setOptimalPosition] = useState<OptimalPosition | null>(null);

  const [iraIntent, setIraIntent] = useState<string | null>(null);
  const [iraAction, setIraAction] = useState<string | null>(null);
  const [iraRamification, setIraRamification] = useState<string | null>(null);

  const {
    activity: liveActivity,
    backendUrl,
    connect,
    disconnect,
    error: liveError,
    events: liveEvents,
    isConnected: isLiveConnected,
    isStreaming,
    latestEvent,
    sendTextSignal,
    status: liveStatus,
    toggleStreaming,
  } = useKernelAgent();

  const hasResults = sovereignDecision || causalChain.length > 0;
  const hasData = frictionContext.trim().length > 0;

  useEffect(() => {
    if (!latestEvent || latestEvent.type !== 'TOKEN_MINTED') {
      return;
    }

    const tokenId = String(latestEvent.payload.token_id || latestEvent.created_at || Date.now());
    const professionLabel = profession || 'COLLECTIVE';
    const nextRipple: RippleNode = {
      id: tokenId,
      lat: Number(latestEvent.payload.lat || 48.8566),
      lng: Number(latestEvent.payload.lng || 2.3522),
      profession: professionLabel,
      label: 'SURGE',
      intensity: Number(latestEvent.payload.intensity || 0.6),
      impact: 'TOKEN_MINTED',
      why: String(latestEvent.payload.tag || latestEvent.payload.signal_type || 'Collective token minted'),
    };

    setRipples(prev => {
      const withoutDupes = prev.filter(ripple => ripple.id !== nextRipple.id);
      return [nextRipple, ...withoutDupes].slice(0, 12);
    });
    setMode('grounded');
  }, [latestEvent, profession]);

  const triggerSimulation = async (payload: SignalPayload) => {
    if (!payload.signal_type || !profession) return;

    const displaySignal = `${payload.signal_type} @ ${payload.location} | ${payload.context}`;
    setCurrentSignal(displaySignal);
    setCurrentMitigation(payload.mitigation || null);
    setIsCalculating(true);

    if (isLiveConnected) {
      sendTextSignal(displaySignal, {
        profession_lens: payload.profession_lens,
        mitigation: payload.mitigation || null,
        context: payload.context,
      });
    }

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal_type: payload.signal_type,
          location: payload.location,
          context: payload.context,
          profession_lens: payload.profession_lens,
          frictionContext: frictionContext.trim() || undefined,
          mitigation: payload.mitigation || undefined,
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
        setIraIntent(data.intent || null);
        setIraAction(data.action || null);
        setIraRamification(data.ramification || null);
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
    setCurrentMitigation(null);
    setCausalChain([]);
    setFlowDynamics(null);
    setFieldState(null);
    setMacroStrain(null);
    setSovereignDecision(null);
    setOptimalPosition(null);
    setIraIntent(null);
    setIraAction(null);
    setIraRamification(null);
  };

  return (
    <main className="relative w-screen h-screen bg-paper overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="absolute top-4 left-4 w-8 h-8 border-t-[1px] border-l-[1px] border-ink/[0.08]" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-[1px] border-r-[1px] border-ink/[0.08]" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-[1px] border-l-[1px] border-ink/[0.08]" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-[1px] border-r-[1px] border-ink/[0.08]" />

      <MapEngine ripples={ripples} />

      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-6 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-6 h-[1px] bg-emerald/40" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-bold text-ink/40">
            Ripple Engine
          </span>
          <span className="text-[7px] text-ink/20 font-mono">v1.0</span>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          {macroStrain && (
            <div className="flex items-center gap-2 font-mono text-[8px]">
              <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse" />
              <span className="text-ink/40">STRAIN:</span>
              <span className="text-amber-500 font-bold">{macroStrain.index.toFixed(2)}</span>
            </div>
          )}

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
            <span>cfg</span>
            <span>Data</span>
            {hasData && <span className="w-1.5 h-1.5 bg-emerald rounded-full" />}
          </button>
        </div>
      </div>

      <div className="absolute top-20 right-4 pointer-events-none z-[25]">
        <div className="bg-paper/90 backdrop-blur-sm border border-ink/10 p-4 w-[180px]">
          <div className="text-[7px] tracking-[0.2em] uppercase text-ink/30 mb-3 font-bold">
            Causal Model
          </div>
          <div className="space-y-2">
            {[
              { label: 'Signal', desc: 'Exogenous event', color: 'bg-ink/60' },
              { label: 'Friction', desc: 'Infrastructure stress', color: 'bg-amber-500' },
              { label: 'Flow', desc: 'Population dynamics', color: 'bg-blue-500' },
              { label: 'Ripple', desc: 'Economic consequence', color: 'bg-emerald' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 ${step.color}`} />
                <div>
                  <div className="text-[9px] font-bold text-ink/70 uppercase tracking-wider">
                    {step.label}
                  </div>
                  <div className="text-[7px] text-ink/40">{step.desc}</div>
                </div>
                {i < 3 && <div className="text-[8px] text-ink/20 ml-auto">v</div>}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-ink/10">
            <div className="text-[7px] tracking-[0.15em] uppercase text-ink/30 mb-2">
              Zone Types
            </div>
            <div className="grid grid-cols-2 gap-1 text-[7px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald rounded-full" />
                <span className="text-ink/50">Opportunity</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-ink/50">Hotspot</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-ink/50">Avoid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-ink/50">Buffer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-24 right-4 pointer-events-auto z-[35]">
        <CollectiveHud
          activity={liveActivity}
          backendUrl={backendUrl}
          error={liveError}
          events={liveEvents}
          isConnected={isLiveConnected}
          isStreaming={isStreaming}
          onConnect={connect}
          onDisconnect={disconnect}
          onToggleStream={toggleStreaming}
          status={liveStatus}
        />
      </div>

      <AnimatePresence>
        {sovereignDecision && !isCalculating && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] pointer-events-auto z-[30]"
          >
            <div className="bg-paper/98 backdrop-blur-xl border-2 border-emerald/30 shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 border-b border-emerald/20 bg-emerald/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald animate-pulse" />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald">
                    Sovereign Decision
                  </span>
                </div>
                <button
                  onClick={resetEngine}
                  className="text-[8px] text-ink/30 hover:text-red-500 uppercase tracking-wider transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <div className="p-5">
                <SovereignDecision decision={sovereignDecision} profession={profession || ''} />

                {(iraIntent || iraAction || iraRamification) && (
                  <div className="mt-4 p-3 bg-ink/[0.02] border border-ink/10">
                    <div className="text-[7px] text-ink/30 uppercase tracking-[0.2em] mb-3 font-bold">
                      Causal Logic Chain
                    </div>
                    <div className="space-y-2">
                      {iraIntent && (
                        <div className="flex items-start gap-2">
                          <div className="w-16 text-[8px] uppercase tracking-wider text-blue-500 font-bold shrink-0">Intent</div>
                          <div className="text-[10px] text-ink/70">{iraIntent}</div>
                        </div>
                      )}
                      {iraIntent && iraAction && <div className="text-ink/20 text-[10px] pl-6">v</div>}
                      {iraAction && (
                        <div className="flex items-start gap-2">
                          <div className="w-16 text-[8px] uppercase tracking-wider text-amber-500 font-bold shrink-0">Action</div>
                          <div className="text-[10px] text-ink/70">{iraAction}</div>
                        </div>
                      )}
                      {iraAction && iraRamification && <div className="text-ink/20 text-[10px] pl-6">v</div>}
                      {iraRamification && (
                        <div className="flex items-start gap-2">
                          <div className="w-16 text-[8px] uppercase tracking-wider text-emerald font-bold shrink-0">Impact</div>
                          <div className="text-[10px] text-ink/80 font-medium">{iraRamification}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-2 bg-ink/[0.02] border-l-2 border-ink/10">
                  <div className="text-[7px] text-ink/30 uppercase tracking-wider mb-1">Input Signal</div>
                  <div className="text-[10px] text-ink/60 italic font-mono">"{currentSignal}"</div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-ink/5 flex items-center justify-between bg-ink/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="text-[7px] text-ink/30 uppercase tracking-wider">
                    {mode === 'grounded' ? 'Grounded Analysis' : 'Predictive Mode'}
                  </span>
                  {currentMitigation && (
                    <span className="text-[7px] text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <span>+</span>
                      <span>{currentMitigation.replace('_', ' ')}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[7px] text-emerald uppercase tracking-wider">
                    {profession?.replace('_', ' ')}
                  </span>
                  <div className="flex gap-0.5">
                    {ripples.map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-emerald" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasResults && !isCalculating && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, delay: 0.1 }}
            className="absolute top-20 left-4 w-[320px] max-h-[calc(100vh-180px)] overflow-y-auto pointer-events-auto"
          >
            <div className="bg-paper/95 backdrop-blur-xl border border-ink/10 shadow-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[8px] tracking-[0.2em] uppercase text-ink/40">
                  Causal Pipeline
                </span>
              </div>

              {fieldState && (
                <div className="mb-3 p-2 bg-ink/[0.02] border-l-2 border-amber-500/30">
                  <div className="text-[7px] text-amber-500/60 uppercase tracking-wider mb-1">Field State</div>
                  <div className="text-[9px] text-ink/60 mb-2">{fieldState.summary}</div>
                  <div className="flex gap-3 text-[8px]">
                    <span className="text-ink/40">Friction: <span className="text-amber-500 font-bold">{fieldState.friction_index.toFixed(2)}</span></span>
                    <span className="text-ink/40">Density: <span className="font-bold">{fieldState.density_pressure}</span></span>
                  </div>
                </div>
              )}

              {flowDynamics && (
                <div className="mb-3">
                  <FlowDynamics flow={flowDynamics} />
                </div>
              )}

              {causalChain.length > 0 && (
                <div className="mb-3">
                  <CausalAncestry chain={causalChain} profession={profession || ''} />
                </div>
              )}

              {optimalPosition && (
                <div className="p-2 bg-emerald/5 border border-emerald/20">
                  <div className="text-[7px] text-emerald uppercase tracking-wider mb-1">Optimal Position</div>
                  <div className="text-[9px] text-ink/70">{optimalPosition.reason}</div>
                  <div className="font-mono text-[8px] text-emerald/70 mt-1">
                    {optimalPosition.lat.toFixed(4)}, {optimalPosition.lng.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {"Signal -> Field -> Flow -> Ripple"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[40]">
        <CommandBar
          profession={profession}
          onProfessionChange={setProfession}
          onSimulate={triggerSimulation}
          isProcessing={isCalculating}
          hasData={hasData}
        />
      </div>

      <div className="absolute bottom-4 left-4 flex gap-4 font-mono text-[7px] text-ink/30 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-emerald animate-pulse rounded-full" />
          <span>Kernel: {isLiveConnected ? 'Live' : 'Online'}</span>
        </div>
        <span>Pipeline: {hasResults ? 'Active' : 'Standby'}</span>
        <span>Ingress: {isStreaming ? 'Multimodal' : 'Dormant'}</span>
      </div>

      <DataDrawer
        isOpen={showDataDrawer}
        onClose={() => setShowDataDrawer(false)}
        context={frictionContext}
        onContextChange={setFrictionContext}
      />
    </main>
  );
}

