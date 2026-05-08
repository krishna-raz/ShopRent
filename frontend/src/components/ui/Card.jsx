import React from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

export const Card = ({ children, className, glass = false, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className={twMerge(
        "bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden",
        glass && "glass hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ title, description, children, className }) => (
  <div className={twMerge("px-6 py-5 border-b border-slate-100/80 bg-slate-50/50", className)}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={twMerge("text-lg font-bold text-slate-900 leading-none tracking-tight", className)}>
    {children}
  </h3>
);

export const CardContent = ({ children, className }) => (
  <div className={twMerge("p-6", className)}>
    {children}
  </div>
);

export default Card;

