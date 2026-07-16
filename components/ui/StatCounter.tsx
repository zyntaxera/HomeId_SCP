import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface StatCounterProps {
  value: number;
  label: string;
  duration?: number;
}

export function StatCounter({ value, label, duration = 1 }: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setDisplayValue(Math.floor(progress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [value, duration, isInView]);

  return (
    <div ref={ref} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-3xl font-black text-slate-800 tabular-nums"
      >
        {displayValue}
      </motion.p>
    </div>
  );
}
