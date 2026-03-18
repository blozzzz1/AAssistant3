import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModelCard } from '../components/ModelCard';
import { ModelCardSkeleton } from '../components/ModelCardSkeleton';
import { DarkSelect } from '../components/DarkSelect';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';
import { AI_MODELS, getModelProviderName } from '../constants/models';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../contexts/PlanContext';
import { usePlanConfig } from '../hooks/usePlanConfig';

const INPUT_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Любой ввод' },
  { value: 'text', label: 'Только текст' },
  { value: 'images', label: 'Изображения' },
  { value: 'files', label: 'Файлы (PDF)' },
  { value: 'video', label: 'Видео' }
];

export const ModelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const filteredAndSortedModels = useMemo(() => {
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

    // Сначала бесплатные, потом премиум (порядок внутри групп сохраняем)
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

  const handleSelectModel = (modelId: string) => {
    if (!user) {
      navigate('/login?redirect=/chat?model=' + modelId + '&new=true');
      return;
    }
    if (!isPremium && !freeIds.includes(modelId)) {
      navigate('/pricing');
      return;
    }
    navigate(`/chat?model=${modelId}&new=true`);
  };

  return (
    <div className="relative min-h-screen bg-[#0d0d0f]">
      <PulsingOrbsBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Текстовые модели</h1>
          <p className="text-gray-400">
            Выберите AI модель для общения и решения задач
          </p>
        </div>

        {/* Поиск */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или описанию..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ModelCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedModels.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Найдено моделей: {filteredAndSortedModels.length}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onSelect={handleSelectModel}
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

        {/* Блок «О моделях» */}
        <div className="mt-16 rounded-xl bg-white/[0.03] border border-white/10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">О текстовых моделях</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Модели поддерживают текст, изображения (Vision), рассуждения (Reasoning), вызов инструментов (Tools),
                аудио и PDF там, где указано в карточке. Выберите модель под задачу и переходите в чат.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
