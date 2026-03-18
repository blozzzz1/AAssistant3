import type { AIModel } from '../types';

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    description: 'Большая открытая модель с отличными возможностями для решения различных задач',
    category: 'general',
    capabilities: ['Анализ информации', 'Решение задач', 'Создание документов']
  },
  {
    id: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
    name: 'Qwen3 Thinking',
    description: 'Продвинутая модель с глубокими мыслительными способностями для сложных задач',
    category: 'reasoning',
    capabilities: ['Сложные рассуждения', 'Стратегическое планирование', 'Анализ проблем']
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528',
    name: 'DeepSeek R1',
    description: 'Специализированная модель для технического анализа и детальной проработки',
    category: 'reasoning',
    capabilities: ['Детальный анализ', 'Обнаружение ошибок', 'Оптимизация решений']
  },
  {
    id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    name: 'Llama 4 Maverick',
    description: 'Модель нового поколения Llama с улучшенным следованием инструкциям',
    category: 'general',
    capabilities: ['Выполнение инструкций', 'Генерация контента', 'Решение проблем'],
    supportsImages: true
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    description: 'Облегченная открытая модель для быстрых ответов и базовых задач',
    category: 'coding',
    capabilities: ['Быстрые ответы', 'Базовые задачи', 'Помощь в работе']
  },
  {
    id: 'Intel/Qwen3-Coder-480B-A35B-Instruct-int4-mixed-ar',
    name: 'Qwen3 Coder',
    description: 'Мощная модель на 480B параметров для комплексной помощи в различных задачах',
    category: 'coding',
    capabilities: ['Создание контента', 'Редактирование', 'Структурирование', 'Работа с текстом']
  },
  {
    id: 'meta-llama/Llama-3.2-90B-Vision-Instruct',
    name: 'Llama Vision',
    description: 'Модель с возможностями зрения для анализа изображений и визуального контента',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Описание контента', 'Визуальный анализ'],
    supportsImages: true
  },
  {
    id: 'mistralai/Mistral-Nemo-Instruct-2407',
    name: 'Mistral Nemo',
    description: 'Эффективная модель для следования инструкциям и решения общих задач',
    category: 'general',
    capabilities: ['Следование инструкциям', 'Объяснения', 'Общая помощь']
  },
  {
    id: 'Qwen/Qwen2.5-VL-32B-Instruct',
    name: 'Qwen2.5 Vision',
    description: 'Продвинутая модель для анализа визуального контента',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Визуальная интерпретация', 'Описание сцен'],
    supportsImages: true
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3',
    description: 'Мощная модель общего назначения с широкими возможностями',
    category: 'general',
    capabilities: ['Универсальные задачи', 'Решение проблем', 'Создание документов']
  },
  {
    id: 'mistralai/Devstral-Small-2505',
    name: 'Devstral Small',
    description: 'Эффективная модель для быстрых задач и оперативных ответов',
    category: 'coding',
    capabilities: ['Быстрая помощь', 'Автоматизация', 'Исправление текста']
  },
  {
    id: 'mistralai/Mistral-Large-Instruct-2411',
    name: 'Mistral Large',
    description: 'Крупномасштабная модель с отличным следованием инструкциям',
    category: 'general',
    capabilities: ['Сложные инструкции', 'Многошаговые задачи', 'Планирование'],
    supportsImages: true
  },
  {
    id: 'moonshotai/Kimi-K2-Thinking',
    name: 'Kimi K2 Thinking',
    description: 'Продвинутая модель с глубокими мыслительными способностями для сложных задач',
    category: 'reasoning',
    capabilities: ['Глубокие рассуждения', 'Решение сложных задач', 'Логический анализ']
  },
  {
    id: 'deepseek-ai/DeepSeek-V3.2',
    name: 'DeepSeek V3.2',
    description: 'Обновленная модель DeepSeek с улучшенной производительностью и точностью',
    category: 'general',
    capabilities: ['Генерация контента', 'Анализ информации', 'Универсальные задачи']
  },
  {
    id: 'zai-org/GLM-4.6',
    name: 'GLM 4.6',
    description: 'Мощная языковая модель с широким контекстом для сложных задач',
    category: 'general',
    capabilities: ['Длинный контекст', 'Комплексные задачи', 'Работа с большими данными']
  },
  {
    id: 'moonshotai/Kimi-K2-Instruct-0905',
    name: 'Kimi K2 Instruct',
    description: 'Модель с отличным следованием инструкциям и широким контекстным окном',
    category: 'general',
    capabilities: ['Следование инструкциям', 'Длинный контекст', 'Детальные объяснения']
  },
  {
    id: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    name: 'Qwen3 Next 80B',
    description: 'Следующее поколение Qwen с улучшенными возможностями для решения задач',
    category: 'coding',
    capabilities: ['Продвинутые решения', 'Стратегические задачи', 'Оптимизация процессов']
  },
  {
    id: 'claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    description: 'Баланс качества и скорости от Anthropic. Vision, Tools, Reasoning. Контекст 1M токенов.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6',
    description: 'Мощная модель от Anthropic с продвинутыми возможностями рассуждения и анализа',
    category: 'general',
    capabilities: ['Глубокий анализ', 'Сложные рассуждения', 'Творческие задачи', 'Код-генерация', 'Анализ изображений'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    description: 'Флагманская модель Anthropic. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Сложные задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    description: 'Быстрая и экономичная модель. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Быстрые ответы'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    description: 'Универсальная модель с контекстом 1M токенов. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Длинный контекст'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-opus-4.1',
    name: 'Claude Opus 4.1',
    description: 'Продвинутая модель Anthropic для сложных задач. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Максимальное качество'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    description: 'Флагманская модель Anthropic. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Сложные задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Универсальная модель Anthropic. Vision, Tools, Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    description: 'Модель Anthropic с поддержкой Vision, Tools и Reasoning.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Общие задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    description: 'Быстрая и экономичная модель. Tools.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Быстрые ответы'],
    supportsImages: false,
    provider: 'aitunnel'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Универсальная модель Anthropic. Vision, Tools.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Универсальные задачи'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'grok-4',
    name: 'Grok 4',
    description: 'Продвинутая модель от xAI с отличными возможностями для диалога и анализа',
    category: 'general',
    capabilities: ['Естественный диалог', 'Анализ данных', 'Творческое письмо', 'Решение задач', 'Анализ изображений'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    description: 'Быстрая модель xAI с поддержкой изображений, инструментов и рассуждений',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Быстрые ответы'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'grok-4-fast',
    name: 'Grok 4 Fast',
    description: 'Быстрая модель xAI с поддержкой изображений, инструментов и рассуждений',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Быстрые ответы'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'grok-code-fast-1',
    name: 'Grok Code Fast 1',
    description: 'Специализированная модель xAI для кода и рассуждений, только текст',
    category: 'coding',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Работа с кодом'],
    supportsImages: false,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Профессиональная мультимодальная модель от Google с поддержкой изображений, видео, аудио и PDF',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Обработка видео', 'Обработка аудио', 'Анализ PDF', 'Мультимодальный анализ'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Быстрая мультимодальная модель от Google с поддержкой изображений и видео',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Обработка видео', 'Быстрые ответы', 'Мультимодальный анализ'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: 'Мультимодальная модель Google: изображения, видео, аудио, PDF. Контекст 1M токенов.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Видео', 'Аудио', 'PDF', 'Tools', 'Reasoning', 'Длинный контекст'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    description: 'Быстрая мультимодальная модель. Vision, Tools, Reasoning, аудио. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Видео', 'Аудио', 'Tools', 'Reasoning', 'Быстрые ответы'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image Preview',
    description: 'Модель с анализом изображений и генерацией картинок (Vision, Reasoning, Image Out).',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Генерация изображений', 'Рассуждения', 'Видео', 'Аудио'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Профессиональная мультимодальная модель. Vision, Tools, Reasoning, аудио.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Видео', 'Аудио', 'Tools', 'Reasoning', 'PDF'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    description: 'Vision, рассуждения и генерация изображений (Image Out). Контекст 32K.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Генерация изображений', 'Рассуждения', 'Видео', 'Аудио'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.5-flash-lite-preview-09-2025',
    name: 'Gemini 2.5 Flash Lite Preview 09/2025',
    description: 'Лёгкая и экономичная модель. Vision, Tools, Reasoning, аудио. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Видео', 'Аудио', 'Tools', 'Reasoning', 'Низкая цена'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Быстрая и дешёвая мультимодальная модель. Vision, Tools, Reasoning, аудио. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Видео', 'Аудио', 'Tools', 'Reasoning', 'Экономичность'],
    supportsImages: true,
    supportsVideo: true,
    supportsAudio: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  // Perplexity (Sonar) — веб-поиск через AITUNNEL: web_search_options
  {
    id: 'sonar-pro-search',
    name: 'Sonar Pro Search',
    description: 'Perplexity: поиск и ответы с поддержкой изображений и рассуждений. Контекст 200K.',
    category: 'general',
    capabilities: ['Веб-поиск', 'Анализ изображений', 'Рассуждения', 'Поиск ответов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'sonar-reasoning-pro',
    name: 'Sonar Reasoning Pro',
    description: 'Perplexity: продвинутые рассуждения и анализ изображений. Контекст 128K.',
    category: 'reasoning',
    capabilities: ['Веб-поиск', 'Анализ изображений', 'Рассуждения', 'Глубокий анализ'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Perplexity: профессиональная модель с поддержкой изображений. Контекст 200K.',
    category: 'general',
    capabilities: ['Веб-поиск', 'Анализ изображений', 'Поиск ответов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'sonar-deep-research',
    name: 'Sonar Deep Research',
    description: 'Perplexity: глубокий исследовательский поиск и рассуждения. Контекст 128K.',
    category: 'reasoning',
    capabilities: ['Веб-поиск', 'Рассуждения', 'Глубокое исследование'],
    provider: 'aitunnel'
  },
  {
    id: 'sonar',
    name: 'Sonar',
    description: 'Perplexity: быстрая модель с поддержкой изображений. Контекст 127K.',
    category: 'general',
    capabilities: ['Веб-поиск', 'Анализ изображений', 'Быстрые ответы'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'sonar-reasoning',
    name: 'Sonar Reasoning',
    description: 'Perplexity: рассуждения и веб-поиск. Контекст 127K.',
    category: 'reasoning',
    capabilities: ['Веб-поиск', 'Рассуждения', 'Анализ'],
    provider: 'aitunnel'
  },
  // GPT-5.2
  {
    id: 'gpt-5.2-chat',
    name: 'GPT-5.2 Chat',
    description: 'Модель OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Универсальные задачи'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro',
    description: 'Продвинутая модель OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Сложные задачи'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    description: 'Модель OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.2-codex',
    name: 'GPT-5.2 Codex',
    description: 'Модель OpenAI для кода. Vision, Tools, Reasoning. Только текст и изображения.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  // GPT-5.1
  {
    id: 'gpt-5.1-codex-max',
    name: 'GPT-5.1 Codex Max',
    description: 'Максимальная кодовая модель. Vision, Tools, Reasoning. Только текст и изображения.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.1',
    name: 'GPT-5.1',
    description: 'Модель OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.1-chat',
    name: 'GPT-5.1 Chat',
    description: 'Чат-модель OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Диалог'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.1-codex',
    name: 'GPT-5.1 Codex',
    description: 'Кодовая модель OpenAI. Vision, Tools, Reasoning. Только текст и изображения.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5.1-codex-mini',
    name: 'GPT-5.1 Codex Mini',
    description: 'Компактная кодовая модель. Vision, Tools, Reasoning. Только текст и изображения.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  // GPT-5
  {
    id: 'gpt-5-image',
    name: 'GPT-5 Image',
    description: 'Модель с генерацией изображений. Vision, Tools, Reasoning, Image Out.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Генерация изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5-pro',
    name: 'GPT-5 Pro',
    description: 'Профессиональная модель OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Сложные задачи'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5-codex',
    name: 'GPT-5 Codex',
    description: 'Кодовая модель OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    supportsPDF: true,
    provider: 'aitunnel'
  },
  // GLM (Z AI) — AITUNNEL
  {
    id: 'glm-5',
    name: 'GLM-5',
    description: 'Модель Z AI. Tools, Reasoning. Контекст 204K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.7-flash',
    name: 'GLM-4.7 Flash',
    description: 'Быстрая модель Z AI. Tools, Reasoning. Контекст 202K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Быстрые ответы'],
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.7',
    name: 'GLM-4.7',
    description: 'Модель Z AI. Tools, Reasoning. Контекст 202K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.6v',
    name: 'GLM-4.6V',
    description: 'Vision-модель Z AI. Изображения и видео. Tools, Reasoning. Контекст 131K.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Анализ видео', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    supportsVideo: true,
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.5v',
    name: 'GLM-4.5V',
    description: 'Vision-модель Z AI. Изображения. Tools, Reasoning. Контекст 65K.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.5',
    name: 'GLM-4.5',
    description: 'Модель Z AI. Tools, Reasoning. Контекст 131K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'glm-4.5-air',
    name: 'GLM-4.5 Air',
    description: 'Облегчённая модель Z AI. Tools, Reasoning. Контекст 131K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения', 'Быстрые ответы'],
    provider: 'aitunnel'
  },
  {
    id: 'glm-4-32b',
    name: 'GLM-4 32B',
    description: 'Модель Z AI. Tools. Контекст 128K. Только текст.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  // Новые модели AITunnel (каталог aitunnel.ru/models)
  {
    id: 'gpt-5.3-codex',
    name: 'GPT 5.3 Codex',
    description: 'OpenAI. Vision, Tools, Reasoning. Контекст 400K.',
    category: 'coding',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения', 'Код'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'qwen3.5-plus-02-15',
    name: 'Qwen3.5 Plus 02 15',
    description: 'Qwen. Vision, Tools, Reasoning. Контекст 1M.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'qwen3.5-397b-a17b',
    name: 'Qwen3.5 397b A17b',
    description: 'Qwen. Vision, Tools, Reasoning. Контекст 256K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'minimax-m2.5',
    name: 'MiniMax M2.5',
    description: 'MiniMax. Tools, Reasoning. Контекст 196K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-max-thinking',
    name: 'Qwen3 Max Thinking',
    description: 'Qwen. Tools, Reasoning. Контекст 262K.',
    category: 'reasoning',
    capabilities: ['Рассуждения', 'Сложные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-coder-next',
    name: 'Qwen3 Coder Next',
    description: 'Qwen. Tools. Контекст 262K.',
    category: 'coding',
    capabilities: ['Вызов инструментов', 'Код'],
    provider: 'aitunnel'
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Moonshot AI. Vision, Tools, Reasoning. Контекст 262K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'minimax-m2-her',
    name: 'MiniMax M2 Her',
    description: 'MiniMax. Контекст 65K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-audio',
    name: 'GPT Audio',
    description: 'OpenAI. Audio In, Audio Out. Контекст 128K.',
    category: 'general',
    capabilities: ['Аудио ввод', 'Аудио вывод'],
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-audio-mini',
    name: 'GPT Audio Mini',
    description: 'OpenAI. Audio In, Audio Out. Контекст 128K.',
    category: 'general',
    capabilities: ['Аудио ввод', 'Аудио вывод'],
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'minimax-m2.1',
    name: 'MiniMax M2.1',
    description: 'MiniMax. Tools, Reasoning. Контекст 196K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'minimax-m2',
    name: 'MiniMax M2',
    description: 'MiniMax. Tools, Reasoning. Контекст 196K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'mistral-large-2512',
    name: 'Mistral Large 2512',
    description: 'Mistral AI. Vision, Tools. Контекст 262K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-v3.2-speciale',
    name: 'DeepSeek V3.2 Speciale',
    description: 'DeepSeek. Reasoning. Контекст 131K.',
    category: 'reasoning',
    capabilities: ['Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-v3.2-exp',
    name: 'DeepSeek V3.2 Exp',
    description: 'DeepSeek. Tools, Reasoning. Контекст 163K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-max',
    name: 'Qwen3 Max',
    description: 'Qwen. Tools. Контекст 256K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-v3.1-terminus',
    name: 'DeepSeek V3.1 Terminus',
    description: 'DeepSeek. Tools, Reasoning. Контекст 131K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-audio-preview',
    name: 'GPT 4o Audio Preview',
    description: 'OpenAI. Tools, Audio In, Audio Out. Контекст 128K.',
    category: 'general',
    capabilities: ['Аудио ввод', 'Аудио вывод', 'Вызов инструментов'],
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'mistral-medium-3.1',
    name: 'Mistral Medium 3.1',
    description: 'Mistral AI. Vision, Tools. Контекст 131K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-coder-30b-a3b-instruct',
    name: 'Qwen3 Coder 30b A3b Instruct',
    description: 'Qwen. Tools. Контекст 262K.',
    category: 'coding',
    capabilities: ['Вызов инструментов', 'Код'],
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-235b-a22b-2507',
    name: 'Qwen3 235b A22b 2507',
    description: 'Qwen. Tools, Reasoning. Контекст 262K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'mistral-small-3.2-24b-instruct',
    name: 'Mistral Small 3.2 24b Instruct',
    description: 'Mistral AI. Vision, Tools. Контекст 131K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'minimax-m1',
    name: 'MiniMax M1',
    description: 'MiniMax. Tools, Reasoning. Контекст 1M.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'o3-pro',
    name: 'O3 Pro',
    description: 'OpenAI. Vision, Tools, Reasoning. Контекст 200K.',
    category: 'reasoning',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'qwen3-30b-a3b',
    name: 'Qwen3 30b A3b',
    description: 'Qwen. Tools, Reasoning. Контекст 40K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'o4-mini',
    name: 'O4 Mini',
    description: 'OpenAI. Vision, Tools, Reasoning. Контекст 200K.',
    category: 'reasoning',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT 4.1',
    description: 'OpenAI. Vision, Tools. Контекст 1M.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT 4.1 Mini',
    description: 'OpenAI. Vision, Tools. Контекст 1M.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT 4.1 Nano',
    description: 'OpenAI. Vision, Tools. Контекст 1M.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'o3-mini',
    name: 'O3 Mini',
    description: 'OpenAI. Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Вызов инструментов'],
    provider: 'aitunnel'
  },
  {
    id: 'minimax-01',
    name: 'MiniMax 01',
    description: 'MiniMax. Vision. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-chat-v3.1',
    name: 'DeepSeek Chat V3.1',
    description: 'DeepSeek. Tools, Reasoning. Контекст 131K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-chat-v3-0324',
    name: 'DeepSeek Chat V3 0324',
    description: 'DeepSeek. Tools, Reasoning. Контекст 640K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Рассуждения'],
    provider: 'aitunnel'
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'DeepSeek. Tools. Контекст 640K.',
    category: 'general',
    capabilities: ['Вызов инструментов'],
    provider: 'aitunnel'
  },
  {
    id: 'o1',
    name: 'O1',
    description: 'OpenAI. Vision, Tools. Контекст 200K.',
    category: 'reasoning',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'o1-pro',
    name: 'O1 Pro',
    description: 'OpenAI. Vision, Reasoning. Контекст 200K.',
    category: 'reasoning',
    capabilities: ['Анализ изображений', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'o1-mini',
    name: 'O1 Mini',
    description: 'OpenAI. Контекст 128K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'codestral-2508',
    name: 'Codestral 2508',
    description: 'Mistral AI. Tools. Контекст 256K.',
    category: 'coding',
    capabilities: ['Вызов инструментов', 'Код'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-mini-search-preview',
    name: 'GPT 4o Mini Search Preview',
    description: 'OpenAI. Контекст 128K.',
    category: 'general',
    capabilities: ['Поиск', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-search-preview',
    name: 'GPT 4o Search Preview',
    description: 'OpenAI. Контекст 128K.',
    category: 'general',
    capabilities: ['Поиск', 'Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.0-flash-lite-001',
    name: 'Gemini 2.0 Flash Lite 001',
    description: 'Google. Vision, Tools, Reasoning, Audio In. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Аудио', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash 001',
    description: 'Google. Vision, Tools, Reasoning, Audio In. Контекст 1M.',
    category: 'vision',
    capabilities: ['Анализ изображений', 'Аудио', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'o3',
    name: 'O3',
    description: 'OpenAI. Vision, Tools, Reasoning. Контекст 200K.',
    category: 'reasoning',
    capabilities: ['Анализ изображений', 'Вызов инструментов', 'Рассуждения'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-2024-11-20',
    name: 'GPT-4o (2024-11-20)',
    description: 'OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-2024-08-06',
    name: 'GPT-4o (2024-08-06)',
    description: 'OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-mini-2024-07-18',
    name: 'GPT-4o Mini (2024-07-18)',
    description: 'OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT 4 Turbo',
    description: 'OpenAI. Vision, Tools. Контекст 128K.',
    category: 'general',
    capabilities: ['Анализ изображений', 'Вызов инструментов'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4',
    name: 'GPT 4',
    description: 'OpenAI. Tools. Контекст 8K.',
    category: 'general',
    capabilities: ['Вызов инструментов'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT 3.5 Turbo',
    description: 'OpenAI. Tools. Контекст 16K.',
    category: 'general',
    capabilities: ['Вызов инструментов', 'Быстрые ответы'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini (2025-08-07)',
    description: 'OpenAI. Контекст 400K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gpt-4o-mini-audio-preview',
    name: 'GPT 4o Mini Audio Preview',
    description: 'OpenAI. Audio In, Audio Out. Контекст 128K.',
    category: 'general',
    capabilities: ['Аудио ввод', 'Аудио вывод'],
    supportsAudio: true,
    provider: 'aitunnel'
  },
  {
    id: 'llama-3.2-1b-instruct',
    name: 'Llama 3.2 1b Instruct',
    description: 'Meta Llama. Контекст 131K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'llama-3.2-3b-instruct',
    name: 'Llama 3.2 3b Instruct',
    description: 'Meta Llama. Контекст 131K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11b Vision Instruct',
    description: 'Meta Llama. Vision. Контекст 131K.',
    category: 'vision',
    capabilities: ['Анализ изображений'],
    supportsImages: true,
    provider: 'aitunnel'
  },
  {
    id: 'gigachat-2',
    name: 'GigaChat 2',
    description: 'Sber. Контекст 128K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gigachat-2-pro',
    name: 'GigaChat 2 Pro',
    description: 'Sber. Контекст 128K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  },
  {
    id: 'gigachat-2-max',
    name: 'GigaChat 2 Max',
    description: 'Sber. Контекст 128K.',
    category: 'general',
    capabilities: ['Универсальные задачи'],
    provider: 'aitunnel'
  }
];

/** ID моделей чата, доступных в бесплатном плане (остальные — только Премиум) */
export const FREE_CHAT_MODEL_IDS = [
  'openai/gpt-oss-20b',
  'mistralai/Mistral-Nemo-Instruct-2407',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'mistralai/Devstral-Small-2505',
  'Qwen/Qwen2.5-VL-32B-Instruct',
  'deepseek-ai/DeepSeek-R1-0528',
];

/** Доступна ли модель для данного плана */
export function isModelAvailableForPlan(modelId: string, isPremium: boolean): boolean {
  if (isPremium) return true;
  return FREE_CHAT_MODEL_IDS.includes(modelId);
}

/** Поддерживает ли модель ввод изображений (для чата при смене модели в одном диалоге) */
export function modelSupportsImages(modelId: string): boolean {
  const m = AI_MODELS.find((x) => x.id === modelId);
  return Boolean(m?.supportsImages);
}

/** Поддерживает ли модель ввод видео */
export function modelSupportsVideo(modelId: string): boolean {
  const m = AI_MODELS.find((x) => x.id === modelId);
  return Boolean(m?.supportsVideo);
}

/** Поддерживает ли модель ввод аудио */
export function modelSupportsAudio(modelId: string): boolean {
  const m = AI_MODELS.find((x) => x.id === modelId);
  return Boolean(m?.supportsAudio);
}

/** Отображаемое имя провайдера по модели (для фильтров и карточек) */
export function getModelProviderName(model: AIModel): string {
  const id = model.id.toLowerCase();
  if (id.startsWith('claude')) return 'Anthropic';
  if (id.startsWith('gemini')) return 'Google';
  if (id.startsWith('grok')) return 'xAI';
  if (id.startsWith('sonar')) return 'Perplexity';
  if (id.startsWith('openai/') || id.includes('gpt-5') || id.includes('gpt-4') || id.includes('gpt-3') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) return 'OpenAI';
  if (id.startsWith('meta-llama') || id.includes('llama')) return 'Meta Llama';
  if (id.startsWith('qwen') || id.includes('qwen')) return 'Qwen';
  if (id.startsWith('deepseek')) return 'DeepSeek';
  if (id.startsWith('mistral') || id.includes('codestral')) return 'Mistral';
  if (id.startsWith('moonshotai') || id.includes('kimi')) return 'Moonshot AI';
  if (id.startsWith('intel/')) return 'Intel';
  if (id.startsWith('zai-org') || id.startsWith('glm')) return 'Z AI';
  if (id.includes('minimax')) return 'MiniMax';
  if (id.startsWith('gigachat')) return 'Sber';
  return 'Intelligence';
}
