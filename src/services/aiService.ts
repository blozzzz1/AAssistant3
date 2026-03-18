import { Message } from '../types';
import { modelSupportsImages, modelSupportsVideo, modelSupportsAudio } from '../constants/models';
import { getAuthToken } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Модели, которые используют AITUNNEL API (каталог aitunnel.ru/models)
const AITUNNEL_MODELS = [
  'claude-sonnet-4.6', 'claude-opus-4.6', 'claude-opus-4.5', 'claude-haiku-4.5', 'claude-sonnet-4.5',
  'claude-opus-4.1', 'claude-opus-4', 'claude-sonnet-4', 'claude-3.7-sonnet', 'claude-3.5-haiku', 'claude-3.5-sonnet',
  'grok-4', 'grok-4.1-fast', 'grok-4-fast', 'grok-code-fast-1',
  'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-3-pro-image-preview',
  'gemini-3-pro-preview', 'gemini-2.5-flash-image', 'gemini-2.5-flash-lite-preview-09-2025', 'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite-001', 'gemini-2.0-flash-001',
  'sonar-pro-search', 'sonar-reasoning-pro', 'sonar-pro', 'sonar-deep-research', 'sonar', 'sonar-reasoning',
  'gpt-5.3-codex', 'gpt-5.2-chat', 'gpt-5.2-pro', 'gpt-5.2', 'gpt-5.2-codex', 'gpt-5.1-codex-max', 'gpt-5.1', 'gpt-5.1-chat',
  'gpt-5.1-codex', 'gpt-5.1-codex-mini', 'gpt-5-image', 'gpt-5-pro', 'gpt-5-codex', 'gpt-5-mini-2025-08-07',
  'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-audio-preview', 'gpt-4o-mini-search-preview', 'gpt-4o-search-preview',
  'gpt-4o-2024-11-20', 'gpt-4o-2024-08-06', 'gpt-4o-mini-2024-07-18', 'gpt-4o-mini-audio-preview',
  'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-audio', 'gpt-audio-mini',
  'o3-pro', 'o3', 'o3-mini', 'o4-mini', 'o1-pro', 'o1', 'o1-mini',
  'glm-5', 'glm-4.7-flash', 'glm-4.7', 'glm-4.6v', 'glm-4.5v', 'glm-4.5', 'glm-4.5-air', 'glm-4-32b',
  'qwen3.5-plus-02-15', 'qwen3.5-397b-a17b', 'qwen3-max-thinking', 'qwen3-coder-next', 'qwen3-max',
  'qwen3-coder-30b-a3b-instruct', 'qwen3-235b-a22b-2507', 'qwen3-30b-a3b',
  'minimax-m2.5', 'minimax-m2-her', 'minimax-m2.1', 'minimax-m2', 'minimax-m1', 'minimax-01',
  'deepseek-v3.2-speciale', 'deepseek-v3.2-exp', 'deepseek-v3.1-terminus',
  'deepseek-chat-v3.1', 'deepseek-chat-v3-0324', 'deepseek-chat',
  'mistral-large-2512', 'mistral-medium-3.1', 'mistral-small-3.2-24b-instruct', 'codestral-2508',
  'kimi-k2.5',
  'llama-3.2-1b-instruct', 'llama-3.2-3b-instruct', 'llama-3.2-11b-vision-instruct',
  'gigachat-2', 'gigachat-2-pro', 'gigachat-2-max',
];

// AITUNNEL-модели, которые принимают только текст и изображения (без PDF/файлов)
const AITUNNEL_TEXT_AND_IMAGES_ONLY = [
  'gpt-5.1-codex-mini',
  'gpt-5.1-codex',
  'gpt-5.1-codex-max',
  'gpt-5.2-codex'
];

export class AIService {
  constructor(_intelligenceApiKey?: string, _aitunnelApiKey?: string) {
    // Keys are used on backend only; constructor kept for compatibility
  }

  private isAITunnelModel(model: string): boolean {
    return AITUNNEL_MODELS.includes(model);
  }

  private formatMessageContent(message: Message, model?: string): any {
    const isAITunnel = model && this.isAITunnelModel(model);
    const contentArray: any[] = [];

    // AITUNNEL: файлы (PDF) только для моделей, которые их поддерживают; Codex — только текст и изображения
    const supportsPdf = isAITunnel && model && !AITUNNEL_TEXT_AND_IMAGES_ONLY.includes(model);
    const hasFiles = supportsPdf && message.files && message.files.length > 0;
    // Изображения добавляем только если текущая модель их поддерживает (при смене модели в чате не слать картинки текстовой модели)
    const hasImages = model && modelSupportsImages(model) && message.images && message.images.length > 0;
    const hasVideo = isAITunnel && model && modelSupportsVideo(model) && message.video && message.video.length > 0;
    const hasAudio = isAITunnel && model && modelSupportsAudio(model) && message.audio && message.audio.length > 0;
    const textContent = (message.content || '').trim();
    const needPlaceholder = (hasFiles || hasImages || hasVideo || hasAudio) && !textContent;

    if (textContent) {
      contentArray.push({ type: 'text', text: textContent });
    } else if (needPlaceholder) {
      let placeholderText = 'Опиши этот документ.';
      if (hasImages && !hasFiles && !hasVideo && !hasAudio) placeholderText = 'Что изображено на этом изображении? Опиши подробно.';
      else if (hasVideo && !hasFiles && !hasImages && !hasAudio) placeholderText = 'Опиши, что происходит в этом видео.';
      else if (hasAudio && !hasFiles && !hasImages && !hasVideo) placeholderText = 'Расшифруй или опиши это аудио.';
      contentArray.push({ type: 'text', text: placeholderText });
    }

    // Изображения после текста
    // Универсальный формат OpenAI: image_url с url (https или data:.../base64,...). Работает с AITUNNEL и vision-моделями Intelligence (Qwen2.5-VL и др.)
    if (hasImages && message.images) {
      message.images.forEach(image => {
        if (image.type === 'url' && image.url) {
          contentArray.push({
            type: 'image_url',
            image_url: { url: image.url }
          });
        } else if (image.type === 'base64' && image.data && image.mimeType) {
          const dataUrl = `data:${image.mimeType};base64,${image.data}`;
          contentArray.push({
            type: 'image_url',
            image_url: { url: dataUrl }
          });
        }
      });
    }

    // Видео — AITUNNEL: type "video_url", video_url: { url } (URL или data URL)
    if (hasVideo && message.video) {
      message.video.forEach((v) => {
        if (v.url) {
          contentArray.push({
            type: 'video_url',
            video_url: { url: v.url }
          });
        }
      });
    }

    // Аудио — AITUNNEL: type "input_audio", input_audio: { data (base64), format: "wav"|"mp3" }
    if (hasAudio && message.audio) {
      message.audio.forEach((a) => {
        if (a.data && a.format) {
          contentArray.push({
            type: 'input_audio',
            input_audio: { data: a.data, format: a.format }
          });
        }
      });
    }

    // Файлы (PDF, DOCX) после текста — формат AITUNNEL: type "file", file: { filename, file_data }
    if (hasFiles && message.files) {
      message.files.forEach(file => {
        if (file.type === 'url' && file.url) {
          contentArray.push({
            type: 'file',
            file: {
              filename: file.filename,
              file_data: file.url
            }
          });
        } else if (file.type === 'base64' && file.data && file.mimeType) {
          const dataUrl = `data:${file.mimeType};base64,${file.data}`;
          contentArray.push({
            type: 'file',
            file: {
              filename: file.filename,
              file_data: dataUrl
            }
          });
        }
      });
    }

    if (contentArray.length === 0) {
      return '';
    }
    if (contentArray.length === 1 && contentArray[0].type === 'text') {
      return contentArray[0].text;
    }
    return contentArray;
  }

  async sendMessage(messages: Message[], model: string): Promise<string> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Требуется авторизация для запросов к AI');
      }

      const formatted = messages.map(msg => ({
        role: msg.role,
        content: this.formatMessageContent(msg, model)
      }));
      const messagesPayload = formatted.map(m => ({
        ...m,
        content: m.content === '' ? ' ' : m.content
      }));

      const data: Record<string, unknown> = {
        model,
        messages: messagesPayload,
        temperature: 0.7
      };
      if (this.isAITunnelModel(model) && model.startsWith('sonar')) {
        data.web_search_options = {};
      }
      // MiniMax (в т.ч. MiniMax-Text-01) не поддерживает max_tokens > 40000
      if (model?.startsWith('minimax')) {
        data.max_tokens = 40000;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const responseText = await response.text().catch(() => '');
      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorData.error || errorMessage;
        } catch {
          // use default
        }
        throw new Error(errorMessage);
      }

      const result = responseText ? JSON.parse(responseText) : {};

      if (result.error) {
        const errMsg = result.error.message || result.error.error?.message || (typeof result.error === 'string' ? result.error : 'API returned an error');
        throw new Error(errMsg);
      }

      const content = result.choices?.[0]?.message?.content;
      if (content === undefined || content === null) {
        throw new Error('Пустой ответ от модели');
      }
      return content;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to get response from AI model. Please try again.');
    }
  }
}