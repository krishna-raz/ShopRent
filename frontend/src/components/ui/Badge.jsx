import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'neutral', className }) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/60 shadow-sm",
    success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.2)]",
    warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.2)]",
    danger: "bg-rose-500/10 text-rose-700 border border-rose-500/20 shadow-[0_2px_10px_-3px_rgba(244,63,94,0.2)]",
    info: "bg-sky-500/10 text-sky-700 border border-sky-500/20 shadow-[0_2px_10px_-3px_rgba(14,165,233,0.2)]",
    indigo: "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.2)]",
  };

  return (
    <span className={twMerge(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
