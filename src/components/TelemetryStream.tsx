"use client";
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelemetryEntry {
  id: number;
  type: 'coord' | 'friction' | 'transit' | 'weather' | 'event';
  data: string;
}

const TELEMETRY_POOL = {
  coord: [
    'LAT: 48.8566 | LNG: 2.3522',
    'LAT: 48.8738 | LNG: 2.2950',
    'LAT: 48.8606 | LNG: 2.3376',
    'LAT: 48.8530 | LNG: 2.3499',
    'LAT: 48.8867 | LNG: 2.3431',
  ],
  friction: [
    'FRICTION: 0.92 | ZONE: 1-4',
    'FRICTION: 0.78 | ZONE: SAINT-DENIS',
    'FRICTION: 0.45 | ZONE: MARAIS',
    'FRICTION: 0.88 | ZONE: INVALIDES',
    'FRICTION: 0.33 | ZONE: BASTILLE',
  ],
  transit: [
    'RER_C: SUSPENDED | ETA: 17:00',
    'LINE_14: NOMINAL | FREQ: 2min',
    'RER_B: DEGRADED | LOAD: 94%',
    'RER_D: SUSPENDED | NORTHERN',
    'METRO_13: NOMINAL | LOAD: 67%',
  ],
  weather: [
    'TEMP: 10C | PRECIP: 0.4mm/hr',
    'WIND: 12km/h NW | VIS: 8km',
    'HUMIDITY: 78% | PRESSURE: 1013',
    'CLOUD: 85% | UV: 1',
    'FEELS: 7C | DEW: 6C',
  ],
  event: [
    'EVENT: RUGBY | ETA: -2:10:00',
    'EVENT: FASHION_WK | STATUS: ACTIVE',
    'CROWD: 80K | EGRESS: PENDING',
    'SURGE: +2.4x | ZONE: STADE',
    'DEMAND: +156% | SECTOR: NE',
  ],
};

const typeColors = {
  coord: 'text-blue-400/60',
  friction: 'text-red-400/60',
  transit: 'text-amber-400/60',
  weather: 'text-cyan-400/60',
  event: 'text-emerald/60',
};

export const TelemetryStream = () => {
  const [entries, setEntries] = useState<TelemetryEntry[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const addEntry = () => {
      const types = Object.keys(TELEMETRY_POOL) as Array<keyof typeof TELEMETRY_POOL>;
      const type = types[Math.floor(Math.random() * types.length)];
      const pool = TELEMETRY_POOL[type];
      const data = pool[Math.floor(Math.random() * pool.length)];

      const newEntry: TelemetryEntry = {
        id: idRef.current++,
        type,
        data,
      };

      setEntries(prev => [...prev.slice(-8), newEntry]);
    };

    // Initial entries
    for (let i = 0; i < 5; i++) {
      setTimeout(addEntry, i * 100);
    }

    // Continuous stream
    const interval = setInterval(addEntry, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[8px] leading-relaxed overflow-hidden h-24">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-1 bg-emerald animate-pulse rounded-full" />
        <span className="text-[7px] tracking-[0.15em] uppercase text-ink/30">
          Live Telemetry
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className={`${typeColors[entry.type]} truncate`}
          >
            <span className="text-ink/20">[</span>
            {entry.data}
            <span className="text-ink/20">]</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
