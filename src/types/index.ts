export interface ImageAttachment {
  type: 'url' | 'base64';
  url?: string;
  data?: string; // Base64 encoded string
  mimeType?: string; // e.g., 'image/jpeg'
}

export interface FileAttachment {
  type: 'url' | 'base64';
  url?: string;
  data?: string; // Base64 encoded string
  mimeType: string; // e.g., 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  filename: string;
  size?: number; // Размер файла в байтах
}

/** Видео для AITUNNEL: url (YouTube или data URL) или base64 data URL */
export interface VideoAttachment {
  type: 'url' | 'base64';
  url: string; // URL видео или data:video/mp4;base64,...
}

/** Аудио для AITUNNEL: base64 + формат wav/mp3 */
export interface AudioAttachment {
  type: 'base64';
  data: string;
  format: 'wav' | 'mp3';
  filename?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: 'coding' | 'reasoning' | 'vision' | 'general';
  capabilities: string[];
  supportsImages?: boolean;
  provider?: 'intelligence' | 'aitunnel'; // По умолчанию 'intelligence'
  supportsVideo?: boolean;
  supportsAudio?: boolean;
  supportsPDF?: boolean;
  /** Только для плана Премиум; иначе модель доступна в бесплатном плане */
  premiumOnly?: boolean;
}

export interface VideoModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
  supportedAspectRatios: string[];
  supportedQualities: string[];
  supportedDurations: number[];
  maxPromptLength: number;
  pricePerSecond?: number; // Цена за секунду в рублях (базовая)
  priceMap?: Record<string, number>; // Маппинг разрешение -> цена за секунду
  /** Модель поддерживает референсное изображение (первый кадр / стиль), напр. Sora 2 */
  supportsReferenceImage?: boolean;
}

export interface ImageModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
  supportedAspectRatios: string[];
  supportedResolutions: string[];
  supportedQualities?: string[]; // e.g., ['low', 'medium', 'high', 'standard', 'hd']
  /** Модель поддерживает редактирование: можно прикрепить изображение к запросу */
  supportsImageInput?: boolean;
  /** Только для dall-e-3: стиль 'vivid' | 'natural' */
  supportedStyles?: ('vivid' | 'natural')[];
  maxPromptLength: number;
  priceMap?: Record<string, number>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  images?: ImageAttachment[];
  files?: FileAttachment[];
  video?: VideoAttachment[];
  audio?: AudioAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  selectedModel: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export type PlanType = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
}

export interface VideoGenerationTask {
  videoId: number;
  prompt: string;
  status: 1 | 5 | 7 | 8; // 1: Success, 5: In progress, 7: Moderation failed, 8: Generation failed
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}
