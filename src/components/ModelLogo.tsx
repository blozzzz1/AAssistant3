import React, { useState } from 'react';

/** Имя файла логотипа по отображаемому имени провайдера (один файл на провайдера) */
export function providerNameToLogoSlug(providerName: string): string {
  const n = (providerName || '').trim().toLowerCase();
  if (!n) return 'default';
  if (n === 'z ai') return 'z-ai';
  if (n === 'xai') return 'xai';
  if (n.includes('meta') || n.includes('llama')) return 'meta';
  if (n.includes('mistral')) return 'mistral';
  if (n.includes('moonshot') || n.includes('kimi')) return 'moonshot';
  if (n.includes('intelligence')) return 'intelligence';
  if (n.includes('perplexity')) return 'perplexity';
  if (n.includes('black forest')) return 'black-forest-labs';
  if (n.includes('anthropic')) return 'anthropic';
  if (n.includes('google')) return 'google';
  if (n.includes('openai')) return 'openai';
  if (n.includes('qwen')) return 'qwen';
  if (n.includes('deepseek')) return 'deepseek';
  if (n.includes('intel')) return 'intel';
  if (n.includes('bytedance')) return 'bytedance';
  if (n.includes('wan')) return 'wan';
  if (n.includes('minimax')) return 'minimax';
  if (n.includes('sber')) return 'sber';
  return n.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Буква для fallback-лого (когда PNG нет) */
function getLogoLetter(providerName: string): string {
  const n = (providerName || '').trim();
  if (!n) return '?';
  if (n === 'Z AI') return 'Z';
  if (n.startsWith('Moonshot') || n.startsWith('Kimi')) return 'K';
  return n[0].toUpperCase();
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  'sm-lg': 'w-9 h-9 text-sm',   // +50% для страницы моделей
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base'
};

/** Цвет фона по провайдеру (для fallback, когда нет PNG) */
function getLogoBg(providerName: string): string {
  const n = (providerName || '').toLowerCase();
  if (n.includes('openai') || n.includes('gpt')) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40';
  if (n.includes('anthropic') || n.includes('claude')) return 'bg-amber-500/30 text-amber-300 border-amber-500/40';
  if (n.includes('google') || n.includes('gemini')) return 'bg-blue-500/30 text-blue-300 border-blue-500/40';
  if (n.includes('qwen')) return 'bg-rose-500/30 text-rose-300 border-rose-500/40';
  if (n.includes('meta') || n.includes('llama')) return 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40';
  if (n.includes('mistral')) return 'bg-orange-500/30 text-orange-300 border-orange-500/40';
  if (n.includes('deepseek')) return 'bg-cyan-500/30 text-cyan-300 border-cyan-500/40';
  if (n.includes('xai') || n.includes('grok')) return 'bg-slate-400/30 text-slate-200 border-slate-400/40';
  if (n.includes('perplexity') || n.includes('sonar')) return 'bg-teal-500/30 text-teal-300 border-teal-500/40';
  if (n.includes('z ai') || n.includes('glm')) return 'bg-violet-500/30 text-violet-300 border-violet-500/40';
  if (n.includes('kimi') || n.includes('moonshot')) return 'bg-pink-500/30 text-pink-300 border-pink-500/40';
  if (n.includes('intel')) return 'bg-sky-500/30 text-sky-300 border-sky-500/40';
  if (n.includes('black forest')) return 'bg-amber-600/30 text-amber-200 border-amber-500/40';
  if (n.includes('bytedance')) return 'bg-slate-500/30 text-slate-200 border-slate-400/40';
  if (n.includes('wan')) return 'bg-teal-500/30 text-teal-300 border-teal-500/40';
  if (n.includes('minimax')) return 'bg-orange-500/30 text-orange-300 border-orange-500/40';
  if (n.includes('sber')) return 'bg-green-500/30 text-green-300 border-green-500/40';
  return 'bg-white/10 text-gray-300 border-white/20';
}

interface ModelLogoProps {
  providerName: string;
  size?: 'sm' | 'sm-lg' | 'md' | 'lg';
  className?: string;
}

/** Логотип модели: PNG из /logos/{slug}.png или fallback — буква в круге */
export const ModelLogo: React.FC<ModelLogoProps> = ({
  providerName,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const slug = providerNameToLogoSlug(providerName);
  const logoUrl = `/logos/${slug}.png`;

  const letter = getLogoLetter(providerName);
  const bg = getLogoBg(providerName);
  const sizeClass = sizeClasses[size];

  if (!imgError && providerName) {
    return (
      <img
        src={logoUrl}
        alt={providerName}
        title={providerName}
        className={`object-contain rounded-lg border border-white/20 flex-shrink-0 ${sizeClass} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-lg border font-semibold flex-shrink-0 ${sizeClass} ${bg} ${className}`}
      title={providerName}
    >
      {letter}
    </span>
  );
};
