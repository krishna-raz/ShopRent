import React from 'react';
import { twMerge } from 'tailwind-merge';

const DataTable = ({ columns, data, onRowClick, className }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <p className="text-sm font-medium">No data available</p>
      </div>
    );
  }

  return (
    <div className={twMerge("overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={twMerge(
                "border-b border-slate-50 hover:bg-slate-50/80 transition-colors group",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3.5 text-sm text-slate-600">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
