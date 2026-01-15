"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface CoinLoadingProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
}

export const CoinLoading = ({ className = '', size = 'md', fullPage = false }: CoinLoadingProps) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  const initialPath = "M0 35 L15 25 L30 32 L45 10 L60 20 L75 5 L100 15";

  const content = (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${size === 'xs' ? 'w-10 h-6' : 'w-48 h-32'} flex items-center justify-center`}>
        {/* Animated Price Graph */}
        <svg
          viewBox="0 0 100 40"
          className="absolute inset-0 w-full h-full overflow-visible"
          fill="none"
          strokeWidth={size === 'xs' ? "3" : "1.5"}
        >
          {size !== 'xs' && (
            <>
              {/* Background Grid */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="2 2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="2 2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="2 2" />
            </>
          )}

          {/* Main Price Line */}
          <motion.path
            d={initialPath}
            className="text-emerald-500"
            stroke="currentColor"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: [0, 1, 0.5, 1],
            }}
            transition={{
              pathLength: { duration: 2, ease: "linear" },
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </svg>

        {/* Floating Coin */}
        <motion.div
          animate={{
            y: size === 'xs' ? [0, -4, 0] : [0, -15, 0],
            rotateY: [0, 180, 360],
            scale: size === 'xs' ? [1, 1.05, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: size === 'xs' ? 2 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`${sizeClasses[size]} bg-gradient-to-br from-amber-300 to-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center border border-amber-200 z-10`}
        >
          <CircleDollarSign size={iconSizes[size]} className="text-amber-900 drop-shadow-sm" />
        </motion.div>
      </div>

      {size !== 'xs' && (
        <>
          {/* Floating Price Indicators */}
          <div className="flex gap-4 mt-2">
            <motion.div 
              animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="flex items-center gap-1 text-[10px] font-bold text-emerald-500"
            >
              <TrendingUp size={10} />
              <span>+4.2%</span>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 5, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-500"
            >
              <TrendingDown size={10} />
              <span>-1.8%</span>
            </motion.div>
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            >
              Synchronizing Market
            </motion.p>
            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                animate={{ x: [-128, 128] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center">
        <div className="relative">
          {/* Pulse circles for depth */}
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"
          />
          {content}
        </div>
      </div>
    );
  }

  return content;
};
