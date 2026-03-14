"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Color mapping based on ripple type
const RIPPLE_COLORS: Record<string, { bg: string; border: string; shadow: string; text: string }> = {
  SURGE: {
    bg: 'bg-emerald',
    border: 'border-emerald/40',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    text: 'text-emerald'
  },
  OPPORTUNITY: {
    bg: 'bg-emerald',
    border: 'border-emerald/40',
    shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    text: 'text-emerald'
  },
  HOTSPOT: {
    bg: 'bg-amber-500',
    border: 'border-amber-500/40',
    shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    text: 'text-amber-500'
  },
  DEAD_ZONE: {
    bg: 'bg-red-500',
    border: 'border-red-500/40',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    text: 'text-red-500'
  },
  AVOID: {
    bg: 'bg-red-500',
    border: 'border-red-500/40',
    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    text: 'text-red-500'
  },
  CRITICAL: {
    bg: 'bg-red-600',
    border: 'border-red-600/40',
    shadow: 'shadow-[0_0_25px_rgba(220,38,38,0.6)]',
    text: 'text-red-600'
  },
  AT_RISK: {
    bg: 'bg-orange-500',
    border: 'border-orange-500/40',
    shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.5)]',
    text: 'text-orange-500'
  },
  BUFFER: {
    bg: 'bg-blue-500',
    border: 'border-blue-500/40',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    text: 'text-blue-500'
  },
  CORRIDOR: {
    bg: 'bg-blue-400',
    border: 'border-blue-400/40',
    shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',
    text: 'text-blue-400'
  },
  MONITOR: {
    bg: 'bg-slate-400',
    border: 'border-slate-400/40',
    shadow: 'shadow-[0_0_15px_rgba(148,163,184,0.4)]',
    text: 'text-slate-500'
  },
};

const DEFAULT_COLOR = {
  bg: 'bg-emerald',
  border: 'border-emerald/40',
  shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  text: 'text-emerald'
};

export const RipplePoint = ({ intensity, label, why, profession }: { intensity: number, label: string, why: string, profession: string }) => {
  const colors = RIPPLE_COLORS[label] || DEFAULT_COLOR;
  const size = 16 + (intensity * 12); // Dynamic size based on intensity

  return (
    <div className="relative flex items-center justify-center cursor-pointer group">
      {/* Outer glow zone */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute rounded-full ${colors.bg} opacity-20`}
        style={{ width: size * 4, height: size * 4 }}
      />

      {/* Core pulse */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.9, 1, 0.9]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`${colors.bg} rounded-full relative z-50 ${colors.shadow}`}
        style={{ width: size, height: size }}
      />

      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{
            scale: 3 + (i * 1.5),
            opacity: 0
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut"
          }}
          className={`absolute ${colors.border} border-2 rounded-full z-40`}
          style={{ width: size, height: size }}
        />
      ))}

      {/* Label and info card */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none text-center">
        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          {/* Type badge */}
          <span className={`text-[10px] tracking-[0.15em] uppercase ${colors.text} font-black drop-shadow-sm block mb-1`}>
            {label.replace('_', ' ')}
          </span>

          {/* Info card (shows on hover) */}
          <div className="mt-2 bg-paper/98 backdrop-blur-md p-3 rounded shadow-2xl border border-ink/10 max-w-[220px] text-left opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-2">
               <span className={`text-[8px] tracking-wider uppercase ${colors.text} font-bold`}>
                 {profession?.replace('_', ' ')}
               </span>
               <span className={`text-[10px] font-black ${colors.text}`}>
                 {Math.round(intensity * 100)}%
               </span>
            </div>
            <div className="h-1.5 w-full bg-ink/5 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intensity * 100}%` }}
                className={`h-full ${colors.bg}`}
              />
            </div>
            <p className="text-[11px] text-ink/70 leading-relaxed">
              {why}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
