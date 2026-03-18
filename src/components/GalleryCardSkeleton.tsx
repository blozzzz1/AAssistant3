import React from 'react';

/** Скелетон карточки галереи (Creative Lab, Библиотека) — соотношение 3:4 */
export const GalleryCardSkeleton: React.FC = () => (
  <div
    className="relative w-full aspect-[3/4] rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden animate-pulse"
    aria-hidden
  >
    <div className="absolute inset-0 bg-white/[0.06]" />
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
      <div className="h-4 w-full rounded bg-white/10 mb-2" />
      <div className="h-3 w-2/3 rounded bg-white/10" />
    </div>
  </div>
);
