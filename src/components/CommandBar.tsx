"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PROFESSIONS = [
  { id: 'FLEET_OPS', label: 'Fleet Ops', desc: '5K+ vehicles' },
  { id: 'SUPPLY_CHAIN', label: 'Supply Chain', desc: 'Last-mile logistics' },
  { id: 'REAL_ESTATE', label: 'Real Estate', desc: 'Dynamic yield' },
  { id: 'GRID_CONTROL', label: 'Grid Control', desc: 'Infrastructure' },
  { id: 'GOV_POLICY', label: 'Gov Policy', desc: 'Emergency response' },
];

const SIGNAL_INJECTIONS = [
  {
    id: 'INJECT_01',
    time: '18:30',
    space: 'GARE DU NORD',
    signal: 'Flash Flood + Line 4 Suspension',
    color: 'blue'
  },
  {
    id: 'INJECT_02',
    time: '21:00',
    space: 'STADE DE FRANCE',
    signal: 'Match Egress + Unplanned Protest',
    color: 'amber'
  },
  {
    id: 'INJECT_03',
    time: '08:00',
    space: 'LA DEFENSE',
    signal: 'Rolling Blackout',
    color: 'red'
  },
];

const MITIGATIONS = [
  { id: 'bus_shuttles', label: 'Extra Bus Shuttles', icon: '🚌' },
  { id: 'load_shedding', label: 'Demand Response', icon: '⚡' },
  { id: 'crowd_diversion', label: 'Crowd Diversion', icon: '👥' },
];

interface CommandBarProps {
  profession: string | null;
  onProfessionChange: (p: string) => void;
  onSimulate: (signal: string, mitigation?: string) => void;
  isProcessing: boolean;
  hasData: boolean;
}

export const CommandBar = ({
  profession,
  onProfessionChange,
  onSimulate,
  isProcessing,
  hasData
}: CommandBarProps) => {
  const [activeMitigation, setActiveMitigation] = useState<string | null>(null);

  const handleInject = (injection: typeof SIGNAL_INJECTIONS[0]) => {
    if (profession && !isProcessing) {
      const fullSignal = `TIME: ${injection.time} | SPACE: ${injection.space} | ${injection.signal}`;
      onSimulate(fullSignal, activeMitigation || undefined);
    }
  };

  const toggleMitigation = (id: string) => {
    setActiveMitigation(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Operator Lens Selector */}
      <div className="flex justify-center gap-1 mb-4">
        {PROFESSIONS.map((p) => (
          <button
            key={p.id}
            onClick={() => onProfessionChange(p.id)}
            className={`
              px-3 py-2 text-[8px] tracking-[0.1em] uppercase transition-all
              ${profession === p.id
                ? 'bg-emerald text-paper'
                : 'bg-paper/80 text-ink/50 hover:text-ink/80 border border-ink/10 hover:border-ink/20'
              }
            `}
          >
            <div className="font-bold">{p.label}</div>
            <div className={`text-[6px] mt-0.5 ${profession === p.id ? 'opacity-70' : 'opacity-40'}`}>
              {p.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Signal Injection Panel */}
      <div className="relative bg-paper/95 backdrop-blur-xl border border-ink/20 shadow-2xl p-4">
        {/* Data indicator */}
        {hasData && (
          <div className="absolute -top-2 right-4 px-2 py-0.5 bg-emerald text-paper text-[6px] tracking-wider uppercase font-bold">
            Twin Active
          </div>
        )}

        <div className="text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-3 flex items-center gap-2">
          <span className="text-emerald font-bold">▶</span>
          <span>Signal Injection</span>
          {!profession && <span className="text-amber-500">(Select operator lens first)</span>}
        </div>

        {/* Injection Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {SIGNAL_INJECTIONS.map((inj) => (
            <button
              key={inj.id}
              onClick={() => handleInject(inj)}
              disabled={!profession || isProcessing}
              className={`
                relative p-3 border text-left transition-all group
                ${!profession || isProcessing
                  ? 'opacity-40 cursor-not-allowed border-ink/10'
                  : 'border-ink/20 hover:border-emerald/50 hover:bg-emerald/5'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`
                  w-2 h-2 rounded-full
                  ${inj.color === 'blue' ? 'bg-blue-500' : ''}
                  ${inj.color === 'amber' ? 'bg-amber-500' : ''}
                  ${inj.color === 'red' ? 'bg-red-500' : ''}
                `} />
                <span className="text-[7px] tracking-wider uppercase text-ink/40 font-mono">
                  {inj.id}
                </span>
              </div>
              <div className="text-[8px] font-mono text-ink/60 mb-1">
                <span className="text-ink/30">T:</span> {inj.time} <span className="text-ink/30 ml-1">@</span> {inj.space}
              </div>
              <div className="text-[9px] font-bold text-ink/80 leading-tight">
                {inj.signal}
              </div>
              <AnimatePresence>
                {profession && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald">
                      INJECT
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-[2px] bg-emerald"
          />
        )}
      </div>

      {/* Counterfactual Toggle - What If? */}
      <div className="mt-3 bg-paper/80 border border-ink/10 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[8px] tracking-[0.15em] uppercase text-ink/40 flex items-center gap-2">
            <span className="text-amber-500">⚡</span>
            <span>Counterfactual</span>
            <span className="text-ink/20">|</span>
            <span className="text-ink/30">What if we deploy...</span>
          </div>
          {activeMitigation && (
            <span className="text-[7px] text-emerald uppercase tracking-wider font-bold">
              Active
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {MITIGATIONS.map((mit) => (
            <button
              key={mit.id}
              onClick={() => toggleMitigation(mit.id)}
              disabled={!profession}
              className={`
                flex-1 px-3 py-2 text-[8px] tracking-wider uppercase transition-all border
                ${activeMitigation === mit.id
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-600'
                  : 'bg-paper border-ink/10 text-ink/40 hover:border-ink/20'
                }
                ${!profession ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <span className="mr-1">{mit.icon}</span>
              {mit.label}
            </button>
          ))}
        </div>
        {activeMitigation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-[8px] text-amber-600/70 text-center"
          >
            Mitigation will be applied to next signal injection
          </motion.div>
        )}
      </div>
    </div>
  );
};
