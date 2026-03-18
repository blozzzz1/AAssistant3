import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { ToolCard } from '../components/ToolCard';
import { TOOLS, Tool, ToolField } from '../constants/tools';
import { AIService } from '../services/aiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

export const ToolsPage: React.FC = () => {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isResultExpanded, setIsResultExpanded] = useState(false);
  // Используем Mistral Large - лучшая модель для следования инструкциям и многошаговых задач
  const selectedModel = 'mistralai/Mistral-Large-Instruct-2411';

  const selectedTool = selectedToolId ? TOOLS.find(t => t.id === selectedToolId) : null;
  const aiService = new AIService();

  const handleSelectTool = (toolId: string) => {
    setSelectedToolId(toolId);
    setFormData({});
    setResult('');
    setError(null);
  };

  const handleBackToCatalog = () => {
    setSelectedToolId(null);
    setFormData({});
    setResult('');
    setError(null);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const buildPrompt = (tool: Tool, data: Record<string, string>): string => {
    let prompt = '';
    
    // Добавляем данные из формы в зависимости от типа инструмента
    if (tool.id === 'article-generator') {
      const lengthMap: Record<string, string> = {
        short: '300-500 слов',
        medium: '500-1000 слов',
        long: '1000+ слов'
      };
      const styleMap: Record<string, string> = {
        formal: 'формальный',
        casual: 'неформальный',
        professional: 'профессиональный',
        creative: 'креативный'
      };
      prompt += `Создай полноценную статью на тему: "${data.topic || ''}"\n\n`;
      prompt += `Требования:\n`;
      prompt += `- Длина: ${lengthMap[data.length || 'medium'] || '500-1000 слов'}\n`;
      if (data.style) prompt += `- Стиль написания: ${styleMap[data.style] || data.style}\n`;
      if (data.additional) prompt += `- Дополнительные требования: ${data.additional}\n`;
      prompt += `\nСтатья должна быть структурированной, информативной и интересной. Включи введение, основную часть и заключение.`;
    } else if (tool.id === 'translator') {
      const langMap: Record<string, string> = {
        en: 'английский',
        ru: 'русский',
        es: 'испанский',
        fr: 'французский',
        de: 'немецкий',
        zh: 'китайский',
        ja: 'японский'
      };
      prompt += `Переведи следующий текст на ${langMap[data.targetLanguage || 'ru'] || data.targetLanguage || 'русский'} язык:\n\n`;
      prompt += `"${data.text || ''}"\n\n`;
      if (data.style && data.style !== 'preserve') {
        prompt += `Стиль перевода: ${data.style}\n`;
      } else {
        prompt += `Сохрани оригинальный стиль и тон текста.\n`;
      }
      prompt += `\nПеревод должен быть точным, естественным и учитывать культурный контекст.`;
    } else if (tool.id === 'text-editor') {
      const actionMap: Record<string, string> = {
        fix: 'Исправь все грамматические, орфографические и пунктуационные ошибки',
        improve: 'Улучши стиль, читаемость и структуру текста',
        paraphrase: 'Перефразируй текст, сохраняя смысл',
        all: 'Исправь ошибки, улучши стиль и перефразируй при необходимости'
      };
      prompt += `${actionMap[data.action || 'all'] || 'Отредактируй следующий текст'}:\n\n`;
      prompt += `"${data.text || ''}"\n\n`;
      if (data.tone && data.tone !== 'keep') {
        prompt += `Измени тон на: ${data.tone}\n`;
      } else {
        prompt += `Сохрани оригинальный тон текста.\n`;
      }
    } else if (tool.id === 'idea-generator') {
      const typeMap: Record<string, string> = {
        content: 'идей для контента',
        project: 'идей для проектов',
        names: 'названий',
        topics: 'тем для статей',
        headlines: 'заголовков'
      };
      prompt += `Сгенерируй ${data.count || '10'} ${typeMap[data.type || 'content'] || 'идей'} на тему: "${data.topic || ''}"\n\n`;
      prompt += `Идеи должны быть:\n`;
      prompt += `- Уникальными и креативными\n`;
      prompt += `- Практичными и реализуемыми\n`;
      prompt += `- Релевантными теме\n`;
      prompt += `\nПредставь каждую идею с кратким описанием.`;
    } else if (tool.id === 'business-plan') {
      prompt += `Создай детальный бизнес-план для проекта:\n\n`;
      prompt += `Название бизнеса: ${data.businessName || ''}\n`;
      prompt += `Отрасль: ${data.industry || ''}\n`;
      prompt += `Описание: ${data.description || ''}\n`;
      if (data.targetAudience) prompt += `Целевая аудитория: ${data.targetAudience}\n`;
      if (data.goals) prompt += `Цели и задачи: ${data.goals}\n`;
      prompt += `\nБизнес-план должен включать:\n`;
      prompt += `1. Резюме проекта\n`;
      prompt += `2. Описание продукта/услуги\n`;
      prompt += `3. Анализ рынка\n`;
      prompt += `4. Маркетинговая стратегия\n`;
      prompt += `5. Организационная структура\n`;
      prompt += `6. Финансовый план\n`;
      prompt += `7. План развития`;
    } else if (tool.id === 'document-analyzer') {
      const analysisMap: Record<string, string> = {
        summary: 'краткое резюме основных моментов',
        keyPoints: 'ключевые моменты и важные факты',
        insights: 'инсайты, выводы и рекомендации',
        actionItems: 'конкретные задачи и действия',
        full: 'полный анализ со всеми аспектами'
      };
      prompt += `Проанализируй следующий документ и предоставь ${analysisMap[data.analysisType || 'full'] || 'полный анализ'}:\n\n`;
      prompt += `"${data.document || ''}"\n\n`;
      if (data.focus) prompt += `Особое внимание удели: ${data.focus}\n`;
      prompt += `\nАнализ должен быть структурированным и понятным.`;
    } else if (tool.id === 'email-generator') {
      const purposeMap: Record<string, string> = {
        business: 'деловое письмо',
        proposal: 'коммерческое предложение',
        'follow-up': 'последующее письмо',
        introduction: 'письмо для знакомства',
        complaint: 'письмо-жалобу',
        thank: 'письмо-благодарность',
        invitation: 'приглашение'
      };
      prompt += `Создай профессиональное ${purposeMap[data.purpose || 'business'] || 'деловое письмо'}:\n\n`;
      if (data.recipient) prompt += `Получатель: ${data.recipient}\n`;
      prompt += `Контекст и детали:\n${data.context || ''}\n`;
      if (data.tone) prompt += `Тон письма: ${data.tone}\n`;
      prompt += `\nПисьмо должно быть вежливым, четким и профессиональным. Включи приветствие, основную часть и подпись.`;
    } else if (tool.id === 'task-planner') {
      const priorityMap: Record<string, string> = {
        high: 'высокий',
        medium: 'средний',
        low: 'низкий'
      };
      prompt += `Разбей следующую задачу на конкретные, выполнимые шаги:\n\n`;
      prompt += `Задача: ${data.task || ''}\n\n`;
      if (data.deadline) prompt += `Срок выполнения: ${data.deadline}\n`;
      if (data.priority) prompt += `Приоритет: ${priorityMap[data.priority] || data.priority}\n`;
      if (data.resources) prompt += `Доступные ресурсы: ${data.resources}\n`;
      prompt += `\nСоздай пошаговый план с четкими действиями, которые можно выполнить последовательно.`;
    } else if (tool.id === 'swot-analysis') {
      prompt += `Проведи детальный SWOT-анализ для следующего проекта:\n\n`;
      prompt += `Название проекта: ${data.projectName || ''}\n`;
      prompt += `Описание: ${data.description || ''}\n`;
      if (data.context) prompt += `Дополнительный контекст: ${data.context}\n`;
      prompt += `\nSWOT-анализ должен включать:\n`;
      prompt += `1. Strengths (Сильные стороны) - внутренние преимущества\n`;
      prompt += `2. Weaknesses (Слабые стороны) - внутренние недостатки\n`;
      prompt += `3. Opportunities (Возможности) - внешние возможности\n`;
      prompt += `4. Threats (Угрозы) - внешние риски\n\n`;
      prompt += `Для каждого пункта предоставь конкретные примеры и рекомендации.`;
    }
    
    return prompt;
  };

  const handleGenerate = async () => {
    if (!selectedTool) return;

    // Проверка обязательных полей
    const requiredFields = selectedTool.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Пожалуйста, заполните все обязательные поля: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult('');

    try {
      const prompt = buildPrompt(selectedTool, formData);
      
      const response = await aiService.sendMessage([
        {
          id: 'system',
          role: 'system',
          content: selectedTool.systemPrompt,
          timestamp: new Date()
        },
        {
          id: 'user',
          role: 'user',
          content: prompt,
          timestamp: new Date()
        }
      ], selectedModel);

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при генерации. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderField = (field: ToolField) => {
    const value = formData[field.id] || '';

    if (field.type === 'textarea') {
      return (
        <textarea
          key={field.id}
          value={value}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          maxLength={field.maxLength}
          className="w-full h-32 px-4 py-3 bg-background-dark border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          key={field.id}
          value={value}
          onChange={(e) => handleFieldChange(field.id, e.target.value)}
          required={field.required}
          className="w-full px-4 py-2 bg-background-dark border border-primary-900/30 rounded-lg text-white focus:outline-none focus:border-primary-500"
        >
          <option value="">Выберите...</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        key={field.id}
        type={field.type}
        value={value}
        onChange={(e) => handleFieldChange(field.id, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        maxLength={field.maxLength}
        className="w-full px-4 py-2 bg-background-dark border border-primary-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
      />
    );
  };

  // Show catalog if no tool is selected
  if (!selectedToolId) {
    const contentTools = TOOLS.filter(t => t.category === 'content');
    const businessTools = TOOLS.filter(t => t.category === 'business');

    return (
      <div className="relative min-h-screen bg-background-darker">
        <PulsingOrbsBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-400" />
              </div>
              <h1 className="text-4xl font-bold text-white">Инструменты</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Мощные AI инструменты для генерации контента и бизнес-задач
            </p>
          </div>

          {/* Content Tools */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Генерация контента</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                />
              ))}
            </div>
          </div>

          {/* Business Tools */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Бизнес и продуктивность</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show tool form when selected
  return (
    <div className="relative min-h-screen bg-background-darker">
      <PulsingOrbsBackground />
      <div className={`relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${isResultExpanded ? 'hidden' : ''}`}>
        <button
          onClick={handleBackToCatalog}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Вернуться к каталогу</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{selectedTool?.name}</h1>
          <p className="text-gray-400 text-lg">{selectedTool?.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background-card border border-primary-900/30 rounded-xl p-6 space-y-6">
              {selectedTool?.fields.map(field => (
                <div key={field.id}>
                  <label className="block text-white font-semibold mb-3">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {field.maxLength && (
                    <p className="text-gray-500 text-sm mt-1">
                      {(formData[field.id] || '').length}/{field.maxLength}
                    </p>
                  )}
                </div>
              ))}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Генерация...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Сгенерировать</span>
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className={`${isResultExpanded ? 'fixed inset-4 z-50' : 'lg:col-span-1'}`}>
            <div className={`bg-background-card border border-primary-900/30 rounded-xl p-6 ${isResultExpanded ? 'h-full flex flex-col' : 'sticky top-24'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Результат</h3>
                <div className="flex items-center gap-2">
                  {result && (
                    <>
                      <button
                        onClick={() => setIsResultExpanded(!isResultExpanded)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title={isResultExpanded ? 'Свернуть' : 'Развернуть'}
                      >
                        {isResultExpanded ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Копировать"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isResultExpanded && (
                <button
                  onClick={handleBackToCatalog}
                  className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Назад</span>
                </button>
              )}

              {result ? (
                <div className={`bg-background-dark rounded-lg p-4 overflow-y-auto ${isResultExpanded ? 'flex-1' : 'max-h-[600px]'}`}>
                  <div className="prose prose-invert max-w-none">
                    <MarkdownRenderer content={result} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Результат появится здесь</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

