import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { AI_MODELS, getModelProviderName } from '../constants/models';
import { ModelCard } from './ModelCard';
import { ModelCardSkeleton } from './ModelCardSkeleton';
import { DarkSelect } from './DarkSelect';
import { usePlan } from '../contexts/PlanContext';
import { usePlanConfig } from '../hooks/usePlanConfig';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const INPUT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Любой ввод' },
  { value: 'text', label: 'Только текст' },
  { value: 'images', label: 'Изображения' },
  { value: 'files', label: 'Файлы (PDF)' },
  { value: 'video', label: 'Видео' }
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const { isPremium } = usePlan();
  const { freeChatModelIds, loading: planConfigLoading } = usePlanConfig();
  const freeIds = planConfigLoading ? [] : freeChatModelIds;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterInput, setFilterInput] = useState('');

  const providers = useMemo(() => {
    const set = new Set(AI_MODELS.map((m) => getModelProviderName(m)));
    return Array.from(set).sort();
  }, []);

  const filteredModels = useMemo(() => {
    let list = [...AI_MODELS];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }

    if (filterProvider) {
      list = list.filter((m) => getModelProviderName(m) === filterProvider);
    }

    if (filterInput) {
      if (filterInput === 'text') {
        list = list.filter(
          (m) => !m.supportsImages && !m.supportsPDF && !m.supportsVideo
        );
      } else if (filterInput === 'images') {
        list = list.filter((m) => m.supportsImages);
      } else if (filterInput === 'files') {
        list = list.filter((m) => m.supportsPDF);
      } else if (filterInput === 'video') {
        list = list.filter((m) => m.supportsVideo);
      }
    }

    // Сначала бесплатные, потом премиум
    return list.sort((a, b) => {
      const aFree = freeIds.includes(a.id);
      const bFree = freeIds.includes(b.id);
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return 0;
    });
  }, [searchQuery, filterProvider, filterInput, freeIds]);

  const hasActiveFilters = Boolean(searchQuery.trim() || filterProvider || filterInput);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterProvider('');
    setFilterInput('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Выберите модель</h2>
        <p className="text-gray-400 text-sm">Идеальная модель для ваших задач</p>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию или описанию..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Фильтры: провайдер и тип ввода (тёмные выпадающие списки) */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500">Фильтры:</span>
        <DarkSelect
          value={filterProvider}
          options={[{ value: '', label: 'Все провайдеры' }, ...providers.map((p) => ({ value: p, label: p }))]}
          onChange={setFilterProvider}
          placeholder="Все провайдеры"
        />
        <DarkSelect
          value={filterInput}
          options={INPUT_FILTER_OPTIONS}
          onChange={setFilterInput}
          placeholder="Любой ввод"
        />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 text-sm"
          >
            <X className="w-4 h-4" />
            Сбросить
          </button>
        )}
      </div>

      {/* Сетка моделей */}
      {planConfigLoading ? (
        <>
          <p className="text-sm text-gray-500">Загрузка моделей...</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : filteredModels.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">
            Найдено моделей: {filteredModels.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onSelect={onModelSelect}
                isSelected={selectedModel === model.id}
                isPremiumModel={!freeIds.includes(model.id)}
                isPremiumUser={isPremium}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-gray-400">Ни одной модели не найдено</p>
          <p className="text-gray-500 text-sm mt-1">Измените поиск или фильтры</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/15 text-sm"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};
