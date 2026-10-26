import React from 'react';

export const RepairSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
          <div className="flex justify-between items-start mb-6">
            <div className="h-12 w-12 bg-slate-100 rounded-xl"></div>
            <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
          </div>
          <div className="h-6 w-3/4 bg-slate-100 rounded mb-4"></div>
          <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-slate-100 rounded mb-8"></div>
          <div className="flex justify-between items-center pt-6 border-t border-slate-50">
            <div className="h-4 w-1/4 bg-slate-100 rounded"></div>
            <div className="h-4 w-4 bg-slate-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
