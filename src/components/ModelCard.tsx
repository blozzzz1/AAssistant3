import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AIModel } from '../types';
import { ModelLogo } from './ModelLogo';

interface ModelCardProps {
  model: AIModel;
  onSelect: (modelId: string) => void;
  isSelected?: boolean;
  /** Модель только для Премиум — оранжевая рамка и плашка (показываем только если пользователь не на Премиуме) */
  isPremiumModel?: boolean;
  /** У пользователя план Премиум — карточки премиум-моделей выглядят обычными */
  isPremiumUser?: boolean;
}

const getProviderInfo = (model: AIModel): { name: string; shortName: string } => {
  const id = model.id.toLowerCase();
  if (id.startsWith('claude')) return { name: 'Anthropic', shortName: 'Anthropic' };
  if (id.startsWith('gemini')) return { name: 'Google', shortName: 'Google' };
  if (id.startsWith('grok')) return { name: 'xAI', shortName: 'xAI' };
  if (id.startsWith('openai/') || id.includes('gpt')) return { name: 'OpenAI', shortName: 'OpenAI' };
  if (id.startsWith('meta-llama') || id.includes('llama')) return { name: 'Meta', shortName: 'Meta' };
  if (id.startsWith('qwen') || id.includes('Qwen')) return { name: 'Qwen', shortName: 'Qwen' };
  if (id.startsWith('deepseek')) return { name: 'DeepSeek', shortName: 'DeepSeek' };
  if (id.startsWith('mistral') || id.includes('codestral')) return { name: 'Mistral AI', shortName: 'Mistral' };
  if (id.startsWith('moonshotai') || id.includes('kimi')) return { name: 'Moonshot AI', shortName: 'Moonshot' };
  if (id.startsWith('intel/')) return { name: 'Intel', shortName: 'Intel' };
  if (id.startsWith('zai-org') || id.startsWith('glm')) return { name: 'Z AI', shortName: 'Z AI' };
  if (id.startsWith('sonar')) return { name: 'Perplexity', shortName: 'Perplexity' };
  if (id.startsWith('minimax')) return { name: 'MiniMax', shortName: 'MiniMax' };
  if (id.startsWith('gigachat')) return { name: 'Sber', shortName: 'Sber' };
  if (id.startsWith('o')) return { name: 'OpenAI', shortName: 'OpenAI' };
  return { name: 'Intelligence.io', shortName: 'API' };
};

export const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect, isSelected, isPremiumModel, isPremiumUser }) => {
  const provider = getProviderInfo(model);
  const showPremiumStyle = Boolean(isPremiumModel && !isPremiumUser);

  const tags: { label: string; color: string }[] = [];
  if (model.supportsImages) tags.push({ label: 'Vision', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' });
  if (model.category === 'reasoning' || model.capabilities.some(c => c.toLowerCase().includes('рассужден'))) {
    tags.push({ label: 'Reasoning', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' });
  }
  if (model.provider === 'aitunnel') {
    tags.push({ label: 'Tools', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' });
  }
  if (model.supportsAudio) tags.push({ label: 'Audio In', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' });
  if (model.supportsPDF) tags.push({ label: 'PDF', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' });
  if (model.supportsVideo) tags.push({ label: 'Video', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' });

  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      className={`group relative w-full text-left rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
        showPremiumStyle
          ? 'bg-amber-500/5 border-amber-500/50 hover:border-amber-400/60 shadow-lg shadow-amber-500/10'
          : isSelected
            ? 'bg-primary-500/10 border-primary-500/60 ring-1 ring-primary-500/30'
            : 'bg-background-card border-white/10 hover:border-gray-600 hover:bg-background-hover'
      }`}
    >
      {/* Акцентная полоска сверху при выборе */}
      {isSelected && !showPremiumStyle && (
        <div className="h-0.5 rounded-t-xl bg-primary-500/60" />
      )}

      {/* Логотип провайдера справа вверху */}
      <div className="absolute top-4 right-4">
        <ModelLogo providerName={provider.name} size="sm-lg" />
      </div>

      <div className="p-5">
        {/* Название модели */}
        <h3 className={`text-lg font-bold mb-1 leading-tight pr-8 ${showPremiumStyle ? 'text-amber-100' : 'text-white'}`}>
          {model.name.toUpperCase()}
        </h3>

        {/* Провайдер */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="text-sm text-gray-400">{provider.name}</span>
        </div>

        {/* Описание (одна строка) */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {model.description}
        </p>

        {/* Теги возможностей */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
          {tags.length === 0 && (
            <span className="px-2.5 py-0.5 text-xs rounded-md bg-white/5 text-gray-400 border border-white/10">
              Текст
            </span>
          )}
        </div>

        {/* Нижняя строка: плашка Премиум слева, стрелка справа */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {showPremiumStyle ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/50">
              Премиум
            </span>
          ) : (
            <span />
          )}
          <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 group-hover:scale-110 transition-all">
            <ArrowRight className="w-4 h-4 text-primary-400" />
          </span>
        </div>
      </div>
    </button>
  );
};
