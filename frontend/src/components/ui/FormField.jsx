import React from 'react';
import { twMerge } from 'tailwind-merge';

const FormField = ({ label, error, className, children, ...props }) => {
  return (
    <div className={twMerge("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
          {label}
        </label>
      )}
      {children ? children : (
        <input
          className={twMerge(
            "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none",
            error ? "border-rose-300" : ""
          )}
          {...props}
        />
      )}
      {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export const Input = ({ className, ...props }) => (
  <input
    className={twMerge(
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none",
      className
    )}
    {...props}
  />
);

export const Select = ({ className, children, ...props }) => (
  <select
    className={twMerge(
      "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
);

export default FormField;
