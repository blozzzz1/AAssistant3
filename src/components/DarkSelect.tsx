import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DarkSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Выпадающий список в тёмной теме сайта */
export const DarkSelect: React.FC<DarkSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Выбрать',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onOutside);
      return () => document.removeEventListener('mousedown', onOutside);
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-w-[140px] px-3 py-2 rounded-lg bg-white/5 text-white text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary-500 flex items-center justify-between gap-2"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[100] mt-1 w-full min-w-[160px] rounded-lg border border-white/15 bg-[#141418] shadow-xl shadow-black/40 py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value || 'empty'}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                opt.value === value
                  ? 'bg-primary-500/25 text-primary-300'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
