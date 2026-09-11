"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TelemetryEntry { id: number; type: "coord" | "friction" | "transit" | "weather" | "event"; data: string; }

const TELEMETRY_POOL = {
  coord: ["LAT: 37.7810 | LNG: -122.4050", "LAT: 37.7710 | LNG: -122.4180", "LAT: 37.7890 | LNG: -122.4300"],
  friction: ["FRICTION: 0.76 | ZONE: HARBOR_GATE", "FRICTION: 0.52 | ZONE: NORTH_BRIDGE", "FRICTION: 0.38 | ZONE: MARKET_SQUARE"],
  transit: ["FERRY: REDUCED | ETA: 14:00", "TRAM: NOMINAL | FREQ: 4min", "SHUTTLE: ACTIVE | LOAD: 72%"],
  weather: ["TEMP: 11C | RAIN: LIGHT", "WIND: 15km/h | VIS: 7km", "HUMIDITY: 76% | PRESSURE: 1012"],
  event: ["EVENT: FESTIVAL | STATUS: EXIT", "CROWD: SIMULATED | FLOW: NORTH", "DEMAND: +42% | SECTOR: HARBOR"],
};

const typeColors = { coord: "text-blue-400/60", friction: "text-red-400/60", transit: "text-amber-400/60", weather: "text-cyan-400/60", event: "text-emerald/60" };

export const TelemetryStream = () => {
  const [entries, setEntries] = useState<TelemetryEntry[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    const addEntry = () => {
      const types = Object.keys(TELEMETRY_POOL) as Array<keyof typeof TELEMETRY_POOL>;
      const type = types[Math.floor(Math.random() * types.length)];
      const pool = TELEMETRY_POOL[type];
      setEntries((previous) => [...previous.slice(-8), { id: idRef.current++, type, data: pool[Math.floor(Math.random() * pool.length)] }]);
    };
    for (let index = 0; index < 5; index += 1) setTimeout(addEntry, index * 100);
    const interval = setInterval(addEntry, 1500 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);
  return <div className="font-mono text-[8px] leading-relaxed overflow-hidden h-24"><div className="flex items-center gap-2 mb-2"><div className="w-1 h-1 bg-emerald animate-pulse rounded-full" /><span className="text-[7px] tracking-[0.15em] uppercase text-ink/30">Synthetic telemetry</span></div><AnimatePresence mode="popLayout">{entries.map((entry) => <motion.div key={entry.id} initial={{ opacity: 0, x: -10, height: 0 }} animate={{ opacity: 1, x: 0, height: "auto" }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className={`${typeColors[entry.type]} truncate`}><span className="text-ink/20">[</span>{entry.data}<span className="text-ink/20">]</span></motion.div>)}</AnimatePresence></div>;
};
