import React from 'react';

/** Скелетон страницы чата (сайдбар + область сообщений) при первой загрузке */
export const ChatPageSkeleton: React.FC = () => (
  <div className="h-screen bg-background-darker flex animate-pulse">
    {/* Сайдбар */}
    <div className="w-80 bg-background-dark border-r border-primary-900/30 flex flex-col">
      <div className="h-[87px] px-4 py-5 border-b border-primary-900/30 flex items-center justify-between">
        <div className="h-6 w-28 rounded bg-white/10" />
        <div className="w-10 h-10 rounded-lg bg-white/10" />
      </div>
      <div className="p-4 border-b border-primary-900/30">
        <div className="h-14 rounded-lg bg-white/10" />
      </div>
      <div className="p-4 border-b border-primary-900/30">
        <div className="h-12 rounded-lg bg-primary-500/20" />
      </div>
      <div className="flex-1 p-4 space-y-2">
        <div className="h-4 w-24 rounded bg-white/10 mb-3" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-white/10" />
        ))}
      </div>
    </div>
    {/* Область чата */}
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-6 flex flex-col gap-4 justify-end">
        <div className="flex justify-start">
          <div className="max-w-[70%] space-y-2">
            <div className="h-4 w-48 rounded-lg bg-white/10" />
            <div className="h-4 w-64 rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[70%] space-y-2">
            <div className="h-4 w-56 rounded-lg bg-primary-500/20 ml-auto" />
            <div className="h-4 w-40 rounded-lg bg-primary-500/20 ml-auto" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-primary-900/30">
        <div className="h-14 rounded-xl bg-white/10 w-full" />
      </div>
    </div>
  </div>
);
