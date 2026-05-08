import React from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

const PageHeader = ({ title, description, actions, icon, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={twMerge("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            {icon}
          </motion.div>
        )}
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-slate-900 tracking-tight"
          >
            {title}
          </motion.h2>
          {description && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-slate-500 mt-1 font-medium"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
      {actions && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PageHeader;
