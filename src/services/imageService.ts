import { getAuthToken } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  quality?: 'low' | 'medium' | 'high' | 'standard' | 'hd';
  size?: string;
  moderation?: 'low' | 'medium' | 'high' | 'auto';
  output_format?: 'png' | 'jpg' | 'jpeg' | 'webp';
  /** Только для dall-e-3 */
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface ImageEditRequest extends ImageGenerationRequest {
  /** Data URL (data:image/...) или URL изображения для редактирования */
  image: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    b64_json?: string; // Base64 encoded image
    url?: string; // Image URL
    revised_prompt?: string;
  }>;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface ImageStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url?: string;
  error?: string;
}

export class ImageService {
  constructor(_apiKey?: string) {
    // API key is used on backend only; constructor kept for compatibility
  }

  async generateImage(params: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Требуется авторизация для генерации изображений');
      }

      const requestBody: Record<string, unknown> = {
        model: params.model,
        prompt: params.prompt,
        output_format: params.output_format || 'png',
      };

      if (params.quality) requestBody.quality = params.quality;
      if (params.size) requestBody.size = params.size;
      if (params.output_format) requestBody.output_format = params.output_format;
      if (params.style && (params.model === 'dall-e-3' || params.model?.includes('dall-e-3'))) requestBody.style = params.style;
      if (params.n) requestBody.n = params.n;

      const response = await fetch(`${API_BASE_URL}/api/ai/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text().catch(() => '');
      if (!response.ok) {
        let errorData: { error?: { message?: string }; message?: string } = {};
        try {
          if (responseText) errorData = JSON.parse(responseText);
        } catch {
          // use default message
        }
        throw new Error(
          errorData.error?.message || (errorData as any).error || `API request failed: ${response.status} ${response.statusText}`
        );
      }

      let result: ImageGenerationResponse = { created: 0, data: [] };
      try {
        if (responseText) result = JSON.parse(responseText);
      } catch {
        // keep default
      }
      if (result.error) {
        throw new Error(result.error.message || 'Image generation request failed');
      }
      return result;
    } catch (error) {
      console.error('Image Service Error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to generate image. Please try again.');
    }
  }

  /** Data URL (data:image/...;base64,...) → Blob для отправки в FormData */
  private dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1] || '');
    const n = bstr.length;
    const u8 = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  }

  /** Редактирование изображения: прикрепить эталон + текстовый запрос (модели с supportsImageInput). Эндпоинт требует multipart/form-data. */
  async editImage(params: ImageEditRequest): Promise<ImageGenerationResponse> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Требуется авторизация для редактирования изображений');
      }

      const formData = new FormData();
      formData.append('model', params.model);
      formData.append('prompt', params.prompt);
      if (params.quality) formData.append('quality', params.quality);
      if (params.size) formData.append('size', params.size);
      formData.append('output_format', params.output_format ?? 'png');
      if (params.n !== undefined) formData.append('n', String(params.n));
      if (params.style && (params.model === 'dall-e-3' || params.model?.includes('dall-e-3'))) {
        formData.append('style', params.style);
      }

      const imageInput = params.image;
      if (imageInput.startsWith('data:')) {
        const blob = this.dataURLtoBlob(imageInput);
        const ext = (imageInput.match(/data:image\/(\w+);/)?.[1] || 'png').replace('jpeg', 'jpg');
        formData.append('image', blob, `image.${ext}`);
      } else if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
        const res = await fetch(imageInput);
        if (!res.ok) throw new Error('Не удалось загрузить изображение по URL');
        const blob = await res.blob();
        formData.append('image', blob, 'image.png');
      } else {
        throw new Error('Изображение должно быть data URL или URL');
      }

      const response = await fetch(`${API_BASE_URL}/api/ai/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text().catch(() => '');
      if (!response.ok) {
        let errorData: { error?: { message?: string }; message?: string } = {};
        try {
          if (responseText) errorData = JSON.parse(responseText);
        } catch {
          // use default
        }
        throw new Error(
          errorData.error?.message || (errorData as any).error || `Edit failed: ${response.status} ${response.statusText}`
        );
      }

      let result: ImageGenerationResponse = { created: 0, data: [] };
      try {
        if (responseText) result = JSON.parse(responseText);
      } catch {
        // keep default
      }
      if (result.error) {
        throw new Error(result.error.message || 'Image edit request failed');
      }
      return result;
    } catch (error) {
      console.error('Image Service editImage Error:', error);
      throw error instanceof Error ? error : new Error('Failed to edit image.');
    }
  }

  async getImageStatus(_imageId: string): Promise<ImageStatusResponse> {
    return {
      status: 'completed',
      image_url: undefined
    };
  }
}
