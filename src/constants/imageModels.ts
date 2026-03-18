import { ImageModel } from '../types';

export const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image Preview',
    description: 'Модель Google с поддержкой Vision, Reasoning и генерации изображений.',
    provider: 'Google',
    capabilities: ['Vision', 'Reasoning', 'Image Out', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 24 }
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    description: 'Быстрая модель Google для генерации изображений с Vision и Reasoning.',
    provider: 'Google',
    capabilities: ['Vision', 'Reasoning', 'Image Out', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 7.68 }
  },
  {
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    description: 'Продвинутая модель для генерации изображений с высоким качеством и детализацией. Поддерживает различные уровни качества и редактирование по эталону.',
    provider: 'OpenAI',
    capabilities: [
      'Высокое качество генерации',
      'Три уровня качества (low, medium, high)',
      'Различные размеры',
      'Редактирование по изображению'
    ],
    supportedAspectRatios: ['1:1', '2:3', '3:2'],
    supportedResolutions: ['1024x1024', '1024x1536', '1536x1024'],
    supportedQualities: ['low', 'medium', 'high'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: {
      'low_1024x1024': 2.09,
      'low_1024x1536': 3.04,
      'low_1536x1024': 3.04,
      'medium_1024x1024': 7.98,
      'medium_1024x1536': 11.97,
      'medium_1536x1024': 11.97,
      'high_1024x1024': 31.73,
      'high_1024x1536': 47.5,
      'high_1536x1024': 47.5
    }
  },
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    description: 'Надежная модель для генерации изображений с хорошим балансом качества и скорости. Поддерживает редактирование по изображению.',
    provider: 'OpenAI',
    capabilities: [
      'Хорошее качество',
      'Три уровня качества',
      'Различные размеры',
      'Редактирование по изображению'
    ],
    supportedAspectRatios: ['1:1', '2:3', '3:2'],
    supportedResolutions: ['1024x1024', '1024x1536', '1536x1024'],
    supportedQualities: ['low', 'medium', 'high'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: {
      'low_1024x1024': 2.09,
      'low_1024x1536': 3.04,
      'low_1536x1024': 3.04,
      'medium_1024x1024': 7.98,
      'medium_1024x1536': 11.97,
      'medium_1536x1024': 11.97,
      'high_1024x1024': 31.73,
      'high_1024x1536': 47.5,
      'high_1536x1024': 47.5
    }
  },
  {
    id: 'gpt-image-1-mini',
    name: 'GPT Image 1 Mini',
    description: 'Легкая и быстрая модель с доступными ценами. Поддерживает редактирование по изображению.',
    provider: 'OpenAI',
    capabilities: [
      'Доступные цены',
      'Три уровня качества',
      'Быстрая генерация',
      'Редактирование по изображению'
    ],
    supportedAspectRatios: ['1:1', '2:3', '3:2'],
    supportedResolutions: ['1024x1024', '1024x1536', '1536x1024'],
    supportedQualities: ['low', 'medium', 'high'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: {
      'low_1024x1024': 0.95,
      'low_1024x1536': 1.14,
      'low_1536x1024': 1.14,
      'medium_1024x1024': 2.09,
      'medium_1024x1536': 2.85,
      'medium_1536x1024': 2.85,
      'high_1024x1024': 6.84,
      'high_1024x1536': 9.88,
      'high_1536x1024': 9.88
    }
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    description: 'Продвинутая модель от OpenAI с превосходным качеством и реалистичностью изображений.',
    provider: 'OpenAI',
    capabilities: [
      'Превосходное качество',
      'Два уровня качества (standard, hd)',
      'Большие разрешения',
      'Стили vivid / natural'
    ],
    supportedAspectRatios: ['1:1', '2:3.5', '3.5:2'],
    supportedResolutions: ['1024x1024', '1024x1792', '1792x1024'],
    supportedQualities: ['standard', 'hd'],
    supportedStyles: ['vivid', 'natural'],
    maxPromptLength: 2048,
    priceMap: {
      'standard_1024x1024': 7.6,
      'standard_1024x1792': 15.2,
      'standard_1792x1024': 15.2,
      'hd_1024x1024': 15.2,
      'hd_1024x1792': 22.8,
      'hd_1792x1024': 22.8
    }
  },
  {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    description: 'Классическая модель для генерации и редактирования изображений с хорошим качеством и доступными ценами.',
    provider: 'OpenAI',
    capabilities: [
      'Хорошее качество',
      'Различные размеры',
      'Редактирование по изображению'
    ],
    supportedAspectRatios: ['1:1', '1:1', '1:1'],
    supportedResolutions: ['1024x1024', '512x512', '256x256'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: {
      'standard_1024x1024': 3.8,
      'standard_512x512': 3.42,
      'standard_256x256': 3.04
    }
  },
  {
    id: 'flux-2-klein-4b',
    name: 'FLUX.2 Klein 4B',
    description: 'Модель Black Forest Labs для генерации и редактирования изображений.',
    provider: 'Black Forest Labs',
    capabilities: ['Генерация', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 2.69 }
  },
  {
    id: 'flux-2-flex',
    name: 'FLUX.2 Flex',
    description: 'Гибкая модель Black Forest Labs для генерации и редактирования изображений.',
    provider: 'Black Forest Labs',
    capabilities: ['Генерация', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 11.52 }
  },
  {
    id: 'flux-2-max',
    name: 'FLUX.2 Max',
    description: 'Максимальное качество Black Forest Labs для генерации и редактирования.',
    provider: 'Black Forest Labs',
    capabilities: ['Генерация', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 13.44 }
  },
  {
    id: 'flux-2-pro',
    name: 'FLUX.2 Pro',
    description: 'Профессиональная модель Black Forest Labs для генерации и редактирования.',
    provider: 'Black Forest Labs',
    capabilities: ['Генерация', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 5.76 }
  },
  {
    id: 'qwen-image-edit',
    name: 'Qwen Image Edit',
    description: 'Модель Qwen для редактирования изображений (прикрепите эталон).',
    provider: 'Qwen',
    capabilities: ['Редактирование'],
    supportedAspectRatios: ['1:1'],
    supportedResolutions: ['1024x1024'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 8.64 }
  },
  {
    id: 'seedream-4.5',
    name: 'Seedream 4.5',
    description: 'Модель Bytedance для генерации и редактирования изображений.',
    provider: 'Bytedance',
    capabilities: ['Генерация', 'Редактирование'],
    supportedAspectRatios: ['1:1', '16:9', '9:16'],
    supportedResolutions: ['1024x1024', '1280x720', '720x1280'],
    supportedQualities: ['standard'],
    supportsImageInput: true,
    maxPromptLength: 2048,
    priceMap: { 'standard_1024x1024': 7.68 }
  }
];
