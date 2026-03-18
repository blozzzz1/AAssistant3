import React from 'react';

/** Скелетон контента админки (таблица или карточки) */
export const AdminContentSkeleton: React.FC<{ variant?: 'table' | 'cards' }> = ({ variant = 'table' }) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-primary-900/30 rounded-lg p-4 bg-background-hover/50">
            <div className="h-5 w-3/4 rounded bg-white/10 mb-3" />
            <div className="h-4 w-1/2 rounded bg-white/10 mb-2" />
            <div className="h-8 w-full rounded bg-white/10 mt-3" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-9 w-9 rounded-lg bg-white/10" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-900/30">
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="text-left p-3">
                  <div className="h-4 w-20 rounded bg-white/10" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, row) => (
              <tr key={row} className="border-b border-primary-900/30">
                {[1, 2, 3, 4, 5].map((i) => (
                  <td key={i} className="p-3">
                    <div className={`h-4 rounded bg-white/10 ${i === 2 ? 'w-24' : 'w-32'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
