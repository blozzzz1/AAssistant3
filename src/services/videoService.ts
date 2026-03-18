import { getAuthToken } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface VideoGenerationRequest {
  model?: string; // e.g. 'sora-2', 'sora-2-pro', 'wan2.5', 'wan2.6'
  negative_prompt?: string;
  prompt: string;
  // AITunnel specific
  size?: string; // e.g., '720x1280', '1280x720'
  seconds?: string | number; // Duration in seconds
  input_reference?: File | string; // Reference image
}

export interface VideoGenerationResponse {
  // AITunnel format (OpenAI compatible)
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'queued';
  progress?: number;
  error?: string;
  // AITunnel specific fields
  object?: string;
  created_at?: number;
  model?: string;
  seconds?: string;
  size?: string;
}

export interface VideoStatusResponse {
  // AITunnel format
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  url?: string;
  download_url?: string;
  error?: string;
}

export class VideoService {
  constructor(_apiKey?: string) {
    // API key is used on backend only; constructor kept for compatibility
  }

  private isUuidLike(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private isAITunnelModel(model?: string): boolean {
    return model === 'sora-2' || model === 'sora-2-pro' || model === 'wan2.5' || model === 'wan2.6';
  }

  /**
   * Wan 2.5/2.6 API принимает resolution только в формате 720P/1080P, не WxH.
   * Конвертируем размер из пикселей в этот формат.
   */
  private mapSizeToResolutionP(model: string | undefined, size: string | undefined): string | undefined {
    if (!size) return size;
    if (model !== 'wan2.6' && model !== 'wan2.5') return size;
    const s = size.replace(/\s/g, '').toLowerCase();
    if (s === '720x1280' || s === '1280x720') return '720P';
    if (s === '1920x1080' || s === '1080x1920') return '1080P';
    // остальные разрешения маппим по высоте/ширине
    if (s.includes('720') || s.includes('480') || s.includes('624') || s.includes('832')) return '720P';
    if (s.includes('1080') || s.includes('960') || s.includes('1088') || s.includes('1440') || s.includes('1632')) return '1080P';
    return '720P';
  }

  /**
   * Normalizes AITunnel video ID for API requests.
   * According to AITunnel API docs, IDs should have 'video_' prefix.
   * IMPORTANT: We should use the ID exactly as returned by API.
   * If ID already has prefix, use it as-is.
   */
  private normalizeAITunnelVideoId(videoId: string): string {
    // По текущим требованиям API AITunnel: video_id должен начинаться с 'video_'.
    // UUID или произвольная строка без префикса приводит к 400 invalid_value.
    if (videoId.startsWith('video_')) return videoId;
    if (this.isUuidLike(videoId)) {
      throw new Error(
        `Некорректный videoId (${videoId}): похоже на UUID. ` +
          `AITunnel ожидает id вида 'video_...'.`
      );
    }
    throw new Error(
      `Некорректный videoId (${videoId}): AITunnel ожидает id вида 'video_...'.`
    );
  }

  async generateVideo(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      return await this.generateVideoAITunnel(params);
    } catch (error) {
      console.error('Video Service Error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to generate video. Please check your API key and try again.');
    }
  }

  private async generateVideoAITunnel(params: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация для генерации видео');
    }

    const formData = new FormData();
    formData.append('model', params.model || 'sora-2');
    formData.append('prompt', params.prompt);

    if (params.size) {
      const sizeToSend = this.mapSizeToResolutionP(params.model, params.size) ?? params.size;
      formData.append('size', sizeToSend);
    }

    if (params.seconds !== undefined) {
      formData.append('seconds', String(params.seconds));
    }

    if (params.input_reference) {
      if (params.input_reference instanceof File) {
        formData.append('input_reference', params.input_reference);
      } else if (typeof params.input_reference === 'string') {
        formData.append('input_reference', params.input_reference);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    // Check response status
    const responseText = await response.text();
    let result: any;
    
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error(`Invalid response from API: ${response.status} ${response.statusText}`);
    }

    // Handle errors according to AITunnel documentation
    if (!response.ok || result.error) {
      const error = result.error || {};
      const errorCode = error.code;
      const errorMessage = error.message || error.code 
        ? `Error ${error.code}: ${error.message || 'Unknown error'}`
        : `API request failed: ${response.status} ${response.statusText}`;
      
      // Log detailed error information
      console.error('AITunnel API Error:', {
        status: response.status,
        error: error,
        metadata: error.metadata,
        response: result
      });

      // Provide more specific error messages
      if (errorCode === 'AllocationQuota.FreeTierOnly') {
        throw new Error(
          'Бесплатный лимит этой модели исчерпан при включённом режиме «use free tier only». ' +
          'Отключите этот режим в кабинете AITunnel или пополните баланс.'
        );
      } else if (error.code === 402) {
        throw new Error('Недостаточно баланса на аккаунте. Пожалуйста, пополните баланс.');
      } else if (error.code === 403) {
        const metadata = error.metadata as any;
        const reasons = metadata?.reasons || [];
        throw new Error(`Модерация не пройдена. Причины: ${reasons.join(', ')}`);
      } else if (error.code === 429) {
        throw new Error('Превышен лимит запросов. Пожалуйста, попробуйте позже.');
      } else if (error.code === 502) {
        throw new Error('Модель временно недоступна. Пожалуйста, попробуйте позже.');
      }
      
      throw new Error(errorMessage);
    }

    const videoId = result.id;
    const mappedResult: VideoGenerationResponse = {
      id: videoId,
      status: this.mapAITunnelStatus(result.status),
      progress: result.progress || 0,
    };
    return mappedResult;
  }

  private mapAITunnelStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    // AITunnel uses: queued, processing, completed, failed
    // We map to our format
    switch (status?.toLowerCase()) {
      case 'queued':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }

  async getVideoStatus(videoId: string | number): Promise<VideoStatusResponse> {
    try {
      return await this.getVideoStatusAITunnel(String(videoId));
    } catch (error) {
      console.error('Video Status Service Error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to get video status. Please try again.');
    }
  }

  private async getVideoStatusAITunnel(videoId: string): Promise<VideoStatusResponse> {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация для проверки статуса видео');
    }

    const apiVideoId = this.normalizeAITunnelVideoId(videoId);
    const url = `${API_BASE_URL}/api/ai/videos/${apiVideoId}`;

    let response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    let responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse status response:', responseText);
      throw new Error(`Invalid response from API: ${response.status} ${response.statusText}`);
    }

    if (!response.ok || result.error) {
      const error = result.error || {};
      if (error.code === 'AllocationQuota.FreeTierOnly') {
        throw new Error(
          'Бесплатный лимит этой модели исчерпан при включённом режиме «use free tier only». ' +
          'Отключите этот режим в кабинете AITunnel или пополните баланс.'
        );
      }
      // Модерация и подобные терминальные ошибки — возвращаем failed, чтобы опрос прекратился и запись обновилась
      const code = (error.code as string) || '';
      const msg = (error.message as string) || '';
      const isModeration = code === 'moderation_blocked' || /moderation|content_policy|blocked/i.test(msg);
      if (isModeration) {
        const errorMessage = msg || (code ? `Error ${code}` : 'Запрос заблокирован модерацией');
        return {
          id: videoId,
          status: 'failed' as const,
          progress: 0,
          error: errorMessage,
        };
      }
      const errorMessage = msg || (code ? `Error ${code}: ${msg || 'Unknown error'}` : `API request failed: ${response.status} ${response.statusText}`);
      throw new Error(errorMessage);
    }

    const mappedResult: VideoStatusResponse = {
      id: result.id,
      status: this.mapAITunnelStatus(result.status),
      progress: result.progress || 0,
      url: result.status === 'completed' ? `${API_BASE_URL}/api/ai/videos/${result.id}/content` : undefined,
      download_url: result.status === 'completed' ? `${API_BASE_URL}/api/ai/videos/${result.id}/content` : undefined,
    };
    return mappedResult;
  }

  async downloadVideo(videoId: string): Promise<Blob> {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Требуется авторизация для скачивания видео');
    }

    const apiVideoId = this.normalizeAITunnelVideoId(videoId);
    const url = `${API_BASE_URL}/api/ai/videos/${apiVideoId}/content`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Failed to download video: ${response.status} ${response.statusText}`;
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // use default
        }
      }
      throw new Error(errorMessage);
    }

    return await response.blob();
  }
}

