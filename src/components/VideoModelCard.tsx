import React from 'react';
import { ArrowRight } from 'lucide-react';
import { VideoModel } from '../types';
import { ModelLogo } from './ModelLogo';

interface VideoModelCardProps {
  model: VideoModel;
  onSelect: (modelId: string) => void;
}

export const VideoModelCard: React.FC<VideoModelCardProps> = ({ model, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(model.id)}
      className="group relative w-full text-left rounded-xl border border-white/10 bg-background-card transition-all duration-200 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-primary-500/50"
    >
      <div className="p-5">
        {/* Логотип провайдера справа вверху */}
        <div className="absolute top-4 right-4">
          <ModelLogo providerName={model.provider} size="sm-lg" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1 leading-tight pr-8">
          {model.name.toUpperCase()}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <ModelLogo providerName={model.provider} size="sm-lg" />
          <span className="text-sm text-gray-400">{model.provider}</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {model.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {model.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs text-gray-500">
          <span>Разрешения: {model.supportedQualities.slice(0, 2).join(', ')}{model.supportedQualities.length > 2 ? '…' : ''}</span>
          <span>·</span>
          <span>{model.supportedDurations.join(', ')} сек</span>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
          <span className="text-xs text-gray-500">Выбрать модель</span>
          <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-all">
            <ArrowRight className="w-4 h-4 text-primary-400" />
          </span>
        </div>
      </div>
    </button>
  );
};
