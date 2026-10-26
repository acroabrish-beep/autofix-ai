import React from 'react';

export const LearningSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
          <div className="w-full h-48 bg-slate-100 rounded-2xl mb-6"></div>
          <div className="h-4 w-1/4 bg-slate-100 rounded mb-4"></div>
          <div className="h-6 w-3/4 bg-slate-100 rounded mb-3"></div>
          <div className="h-4 w-full bg-slate-100 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-slate-100 rounded mb-8"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
            <div className="h-10 w-1/3 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
