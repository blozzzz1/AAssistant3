import React from 'react';
import { ArrowRight, FileText, Languages, Edit, Lightbulb, Briefcase, FileSearch, Mail, CheckSquare, TrendingUp, Sparkles } from 'lucide-react';
import { Tool } from '../constants/tools';

interface ToolCardProps {
  tool: Tool;
  onSelect: (toolId: string) => void;
}

// Иконки из lucide-react
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Languages,
  Edit,
  Lightbulb,
  Briefcase,
  FileSearch,
  Mail,
  CheckSquare,
  TrendingUp,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const Icon = iconMap[tool.icon] || Sparkles;

  return (
    <div className="bg-background-card border border-primary-900/30 rounded-2xl overflow-hidden hover:border-primary-600 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 group flex flex-col h-full">
      {/* Gradient Header */}
      <div className={`h-32 bg-gradient-to-br ${tool.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs border backdrop-blur-sm bg-white/10 text-white border-white/20">
            {tool.category === 'content' ? 'Контент' : 'Бизнес'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {tool.name}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow min-h-[40px]">
          {tool.description}
        </p>

        {/* Select Button */}
        <button
          onClick={() => onSelect(tool.id)}
          className="w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-all flex items-center justify-center gap-2 mt-auto"
        >
          Использовать
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

