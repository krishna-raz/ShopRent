import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
      />
      <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-20 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loader;
