import { VideoModel } from '../types';

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'sora-2',
    name: 'Sora 2',
    description: 'Продвинутая модель от OpenAI для генерации реалистичных видео. Отличное качество и детализация.',
    provider: 'OpenAI',
    capabilities: [
      'Генерация реалистичных видео',
      'Высокое качество',
      'Поддержка различных размеров',
      'Быстрая генерация',
      'Референсное изображение (первый кадр)'
    ],
    supportedAspectRatios: ['9:16', '16:9'],
    supportedQualities: ['720x1280', '1280x720'],
    // По текущим ограничениям API: seconds ∈ {4, 8, 12}
    supportedDurations: [4, 8, 12],
    maxPromptLength: 2048,
    pricePerSecond: 19,
    supportsReferenceImage: true
  },
  {
    id: 'sora-2-pro',
    name: 'Sora 2 Pro',
    description: 'Профессиональная версия Sora 2 с улучшенным качеством и поддержкой больших разрешений.',
    provider: 'OpenAI',
    capabilities: [
      'Профессиональное качество',
      'Большие разрешения',
      'Улучшенная детализация',
      'Расширенные возможности'
    ],
    supportedAspectRatios: ['9:16', '16:9', '16:28', '28:16'],
    supportedQualities: ['720x1280', '1280x720', '1024x1792', '1792x1024'],
    // seconds ∈ {4, 8, 12}
    supportedDurations: [4, 8, 12],
    maxPromptLength: 2048,
    pricePerSecond: 57, // Base price for 720x1280/1280x720
    supportsReferenceImage: true,
    priceMap: {
      '720x1280': 57,
      '1280x720': 57,
      '1024x1792': 95,
      '1792x1024': 95
    }
  },
  {
    id: 'wan2.6',
    name: 'Wan 2.6',
    description: 'Модель для генерации видео с длительностями 5, 10 и 15 секунд.',
    provider: 'Qwen',
    capabilities: [
      'Генерация видео',
      'Длительность 5, 10, 15 с',
      'Различные разрешения',
      'Референсное изображение (первый кадр)'
    ],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedQualities: ['1280x720', '720x1280', '1920x1080', '1080x1920'],
    supportedDurations: [5, 10, 15],
    maxPromptLength: 2048,
    pricePerSecond: 3.84, // от 19.2 ₽ за видео (5 с)
    priceMap: {
      '1280x720': 3.84,
      '720x1280': 3.84,
      '1920x1080': 5.76,
      '1080x1920': 5.76
    },
    supportsReferenceImage: true
  },
  {
    id: 'wan2.5',
    name: 'Wan 2.5',
    description: 'Универсальная модель с гибкими настройками качества и доступными ценами. Подходит для различных задач.',
    provider: 'WAN',
    capabilities: [
      'Гибкие настройки качества',
      'Доступные цены',
      'Множество разрешений',
      'Различные форматы',
      'Референсное изображение (первый кадр)'
    ],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '5:4', '4:5'],
    supportedQualities: ['832x480', '480x832', '624x624', '1280x720', '720x1280', '960x960', '1088x832', '832x1088', '1920x1080', '1080x1920', '1440x1440', '1632x1248', '1248x1632'],
    supportedDurations: [5, 10],
    maxPromptLength: 2048,
    pricePerSecond: 9.5, // Base price for lowest resolution
    // Price mapping: resolution -> price per second
    priceMap: {
      '832x480': 9.5,
      '480x832': 9.5,
      '624x624': 9.5,
      '1280x720': 19,
      '720x1280': 19,
      '960x960': 19,
      '1088x832': 19,
      '832x1088': 19,
      '1920x1080': 28.5,
      '1080x1920': 28.5,
      '1440x1440': 28.5,
      '1632x1248': 28.5,
      '1248x1632': 28.5
    },
    supportsReferenceImage: true
  }
];

