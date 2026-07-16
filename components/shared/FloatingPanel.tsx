import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FloatingPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function FloatingPanel({ title, onClose, children, width = '2xl' }: FloatingPanelProps) {
  const widthClasses = {
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    '2xl': 'w-full max-w-2xl',
    '3xl': 'w-full max-w-4xl'
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`absolute left-0 sm:left-24 top-0 sm:top-4 bottom-16 sm:bottom-4 z-[100] sm:z-30 w-full sm:${widthClasses[width]} bg-white/95 sm:bg-white/90 backdrop-blur-md sm:border sm:border-slate-200/50 shadow-2xl sm:rounded-3xl overflow-hidden flex flex-col`}
    >
      <div className="px-6 py-4 bg-white/50 border-b border-slate-200/50 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
        <h2 className="font-extrabold text-slate-800 text-lg">{title}</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
}
