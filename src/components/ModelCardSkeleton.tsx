import React from 'react';

export const ModelCardSkeleton: React.FC = () => (
  <div
    className="relative w-full rounded-xl border-2 border-white/10 bg-background-card overflow-hidden"
    aria-hidden
  >
    <div className="p-5">
      <div className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-white/[0.06]" />
      <div className="pr-10 animate-pulse">
        <div className="h-5 w-[70%] rounded bg-white/[0.08] mb-3" />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-white/[0.06]" />
          <div className="h-4 w-20 rounded bg-white/[0.06]" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full rounded bg-white/[0.06]" />
          <div className="h-4 w-[85%] rounded bg-white/[0.06]" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-14 rounded-md bg-white/[0.06]" />
          <div className="h-6 w-16 rounded-md bg-white/[0.06]" />
          <div className="h-6 w-12 rounded-md bg-white/[0.06]" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="h-5 w-14 rounded bg-white/[0.06]" />
          <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  </div>
);
