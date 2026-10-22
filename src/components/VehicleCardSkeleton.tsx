import React from 'react';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 pl-6 flex flex-col justify-between gap-4 animate-pulse overflow-hidden"
    >
      {/* Skeleton Accent Bar */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-200" />

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-6 w-16 bg-slate-200 rounded-md" />
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
        </div>

        <div className="space-y-2 mt-2">
          <div className="h-6 w-28 bg-slate-200 rounded-md" />
          <div className="h-4 w-44 bg-slate-200/70 rounded-md" />
          <div className="h-3.5 w-full bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Speed & Heading placeholder */}
      <div className="h-7 w-full bg-slate-100 rounded-lg" />

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-36 bg-slate-200 rounded" />
          <div className="h-3.5 w-10 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
};
