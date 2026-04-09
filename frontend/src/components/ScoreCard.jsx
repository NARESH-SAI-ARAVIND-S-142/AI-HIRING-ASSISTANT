import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScoreCard({ title, score, highlight }) {
  const [displayScore, setDisplayScore] = useState(0);
  const safeScore = Math.round(score || 0);
  
  // Animated count-up effect
  useEffect(() => {
    if (safeScore === 0) return;
    const duration = 1200;
    const steps = 40;
    const increment = safeScore / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= safeScore) {
        setDisplayScore(safeScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [safeScore]);

  const isHigh = safeScore >= 70;
  const isMed = safeScore >= 50 && safeScore < 70;
  
  const colorClass = isHigh ? 'text-emerald-400' : isMed ? 'text-amber-400' : 'text-red-400';
  const gradientFrom = isHigh ? '#10b981' : isMed ? '#f59e0b' : '#ef4444';
  const gradientTo = isHigh ? '#06b6d4' : isMed ? '#eab308' : '#f87171';

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((displayScore) / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className={`glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group ${
        highlight ? 'border-brand-primary/40 ring-1 ring-brand-primary/20' : ''
      }`}
    >
      {highlight && <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-primary to-brand-cyan"></div>}
      
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{title}</h4>
      
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} className="stroke-white/5 fill-none" strokeWidth="5" />
          <circle 
            cx="48" cy="48" r={radius}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            stroke={`url(#gradient-${title.replace(/\s/g, '')})`}
            style={{ 
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-out'
            }} 
          />
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-display font-bold ${colorClass}`}>{displayScore}</span>
        </div>
      </div>
    </motion.div>
  );
}
