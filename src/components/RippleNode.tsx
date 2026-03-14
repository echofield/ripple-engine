"use client";
import React from 'react';
import { motion } from 'framer-motion';

export const RipplePoint = ({ intensity, label, why, profession }: { intensity: number, label: string, why: string, profession: string }) => {
  return (
    <div className="relative flex items-center justify-center cursor-pointer">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="bg-emerald w-4 h-4 rounded-full relative z-50 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
      />

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{
            scale: 4 * (i + 1),
            opacity: 0
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut"
          }}
          className="absolute border border-emerald/40 rounded-full w-4 h-4 z-40"
        />
      ))}

      <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none text-center">
        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
        >
          <span className="text-[10px] tracking-micro uppercase text-emerald font-bold drop-shadow-sm block mb-[2px]">
            {profession}
          </span>
          <span className="text-[9px] tracking-micro uppercase text-ink/60 font-medium block">
            {label}
          </span>

          <div className="mt-2 bg-paper/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-ink/5 max-w-[200px] text-left">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-1 flex-1 bg-ink/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${intensity * 100}%` }}
                    className="h-full bg-emerald"
                  />
               </div>
               <span className="text-[8px] font-bold text-emerald">{Math.round(intensity * 100)}%</span>
            </div>
            <p className="text-[11px] text-ink/80 leading-relaxed font-normal">
              {why}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
