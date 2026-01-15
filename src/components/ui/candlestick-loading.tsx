"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CandlestickLoadingProps {
  className?: string;
  fullPage?: boolean;
  message?: string;
}

const Candle = ({ 
  delay, 
  color, 
  height, 
  wickHeight, 
  duration = 8 
}: { 
  delay: number; 
  color: 'green' | 'red'; 
  height: number; 
  wickHeight: number;
  duration?: number;
}) => {
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      initial={{ x: "150%", opacity: 0 }}
      animate={{ 
        x: "-150%",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    >
      {/* Top Wick */}
      <div 
        className={cn(
          "w-[2px] rounded-full", 
          color === 'green' ? 'bg-[#00C076]/40' : 'bg-[#FF3A5C]/40'
        )} 
        style={{ height: wickHeight }} 
      />
      {/* Body */}
      <div 
        className={cn(
          "w-3.5 rounded-full my-[1px]", 
          color === 'green' 
            ? 'bg-[#00C076] shadow-[0_0_15px_rgba(0,192,118,0.4)]' 
            : 'bg-[#FF3A5C] shadow-[0_0_15px_rgba(255,58,92,0.4)]'
        )} 
        style={{ height: height }} 
      />
      {/* Bottom Wick */}
      <div 
        className={cn(
          "w-[2px] rounded-full", 
          color === 'green' ? 'bg-[#00C076]/40' : 'bg-[#FF3A5C]/40'
        )} 
        style={{ height: wickHeight }} 
      />
    </motion.div>
  );
};

export const CandlestickLoading = ({ 
  className = '', 
  fullPage = false,
  message = "MARKET LIVE"
}: CandlestickLoadingProps) => {
  const candles = useMemo(() => [
    { delay: 0, color: 'green' as const, height: 40, wickHeight: 12 },
    { delay: 0.5, color: 'red' as const, height: 50, wickHeight: 15 },
    { delay: 1.2, color: 'red' as const, height: 35, wickHeight: 10 },
    { delay: 1.8, color: 'green' as const, height: 60, wickHeight: 20 },
    { delay: 2.5, color: 'red' as const, height: 45, wickHeight: 12 },
    { delay: 3.2, color: 'green' as const, height: 30, wickHeight: 8 },
    { delay: 4.0, color: 'green' as const, height: 55, wickHeight: 18 },
    { delay: 4.8, color: 'red' as const, height: 40, wickHeight: 12 },
    { delay: 5.5, color: 'red' as const, height: 50, wickHeight: 15 },
    { delay: 6.2, color: 'green' as const, height: 35, wickHeight: 10 },
    { delay: 7.0, color: 'green' as const, height: 60, wickHeight: 20 },
  ], []);

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-6 w-full", className)}>
      <div className="relative w-full max-w-4xl h-48 flex items-center justify-center overflow-hidden rounded-[20px] border border-white/5 bg-[#040914] shadow-2xl">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }} 
        />

        {/* Label */}
        <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#00C076] shadow-[0_0_8px_#00C076]" 
          />
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#00C076]/90 font-mono">
            {message}
          </span>
        </div>

        {/* Animated Candles Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center">
            {candles.map((candle, i) => (
              <Candle key={i} {...candle} />
            ))}
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-[#00C076]/5 blur-[60px] pointer-events-none" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-[#FF3A5C]/5 blur-[60px] pointer-events-none" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-slate-500 font-mono tracking-[0.2em] uppercase"
        >
          Establishing Secure Connection
        </motion.p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-[#00C076]/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#020611] z-[100] flex items-center justify-center p-8">
        <div className="relative z-10 w-full max-w-5xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
