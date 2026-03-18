import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap } from 'lucide-react';
import { usePlan } from '../contexts/PlanContext';
import { usePlanConfig } from '../hooks/usePlanConfig';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

const PREMIUM_PRICE_MONTH = 1600;

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { plan, setPlan, isPremium } = usePlan();
  const { freeChatModelIds, freeImageLimit, freeVideoLimit, loading: planConfigLoading } = usePlanConfig();

  const freeModelsCount = freeChatModelIds.length;

  return (
    <div className="relative min-h-screen bg-[#0d0d0f] py-12 px-4">
      <PulsingOrbsBackground />
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Тарифы</h1>
        <p className="text-gray-400 text-center mb-10">Выберите план и откройте доступ ко всем возможностям</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Бесплатный */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-gray-400" />
                Бесплатный
              </h2>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">0 ₽</span>
              <span className="text-gray-400 ml-1">/ месяц</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {planConfigLoading ? (
                  <span className="text-gray-500">… текстовых моделей</span>
                ) : (
                  <>
                    {freeModelsCount} {freeModelsCount === 1 ? 'текстовая модель' : freeModelsCount < 5 ? 'текстовые модели' : 'текстовых моделей'}
                  </>
                )}
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {planConfigLoading ? (
                  <span className="text-gray-500">… видео в день</span>
                ) : (
                  `${freeVideoLimit} видео в день`
                )}
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {planConfigLoading ? (
                  <span className="text-gray-500">… изображений в день</span>
                ) : (
                  `${freeImageLimit} ${freeImageLimit === 1 ? 'изображение' : freeImageLimit < 5 ? 'изображения' : 'изображений'} в день`
                )}
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-4 h-4 flex-shrink-0" />
                Остальные модели — в Премиум
              </li>
            </ul>
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
            >
              {!isPremium ? 'Текущий план' : 'Перейти в настройки'}
            </button>
          </div>

          {/* Премиум */}
          <div className="relative rounded-2xl border-2 border-amber-500/50 bg-amber-500/5 p-6 flex flex-col">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/40">
              скидка 20%
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Премиум
              </h2>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-white">{PREMIUM_PRICE_MONTH} ₽</span>
              <span className="text-gray-400 ml-1">/ месяц</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Все текстовые модели
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Безлимитная генерация видео
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Безлимитная генерация изображений
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Без водяных знаков и рекламы
              </li>
            </ul>
            {isPremium ? (
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="w-full py-3 rounded-xl bg-amber-500/30 text-amber-200 font-medium border border-amber-500/50"
              >
                Текущий план
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/payment?plan=premium')}
                className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
              >
                Подписаться
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
