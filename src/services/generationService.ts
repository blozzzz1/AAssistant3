const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface ImageGeneration {
  id: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  quality?: string;
  size?: string;
  outputFormat?: string;
  numImages?: number;
  imageUrls: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  isPublic?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface VideoGeneration {
  id: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  videoId?: string;
  videoUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'moderation_failed';
  errorMessage?: string;
  aspectRatio?: string;
  duration?: number;
  quality?: string;
  motionMode?: string;
  style?: string;
  cameraMovement?: string;
  seed?: number;
  waterMark?: boolean;
  size?: string;
  seconds?: number;
  isPublic?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export class GenerationService {
  private static async getAuthToken(): Promise<string | null> {
    try {
      const { supabase } = await import('../config/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Image Generation Methods
  static async createImageGeneration(params: {
    model: string;
    prompt: string;
    negativePrompt?: string;
    quality?: string;
    size?: string;
    outputFormat?: string;
    numImages?: number;
    imageUrls?: string[];
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
  }): Promise<{ generation: ImageGeneration | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/generations/image`;
      console.log('Creating image generation:', { url, params: { ...params, imageUrls: params.imageUrls?.length } });
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', { status: response.status, error: errorData });
        return { generation: null, error: errorData.error || `Failed to create image generation (${response.status})` };
      }

      const data = await response.json();
      console.log('Image generation created successfully:', data.generation?.id);
      return { generation: data.generation, error: null };
    } catch (error) {
      console.error('Error creating image generation:', error);
      return { generation: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async updateImageGeneration(
    id: string,
    params: {
      imageUrls?: string[];
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      errorMessage?: string;
      isPublic?: boolean;
    }
  ): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/generations/image/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        return { error: errorData.error || `Failed to update image generation (${response.status})` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating image generation:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async deleteImageGeneration(id: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/generations/image/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: { error?: string };
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        return { error: errorData.error || 'Не удалось удалить генерацию' };
      }
      return { error: null };
    } catch (error) {
      console.error('Error deleting image generation:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async getUserImageGenerations(opts?: { limit?: number; offset?: number }): Promise<{ generations: ImageGeneration[]; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (opts?.limit != null) params.set('limit', String(opts.limit));
      if (opts?.offset != null) params.set('offset', String(opts.offset));
      const q = params.toString();
      const url = `${API_BASE_URL}/api/generations/image${q ? `?${q}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', { status: response.status, error: errorData });
        return { generations: [], error: errorData.error || `Failed to fetch image generations (${response.status})` };
      }

      const data = await response.json();
      const raw = data.generations || [];
      const generations: ImageGeneration[] = raw.map((g: any) => ({
        ...g,
        isPublic: g.is_public ?? g.isPublic ?? false,
        createdAt: g.created_at ?? g.createdAt,
        updatedAt: g.updated_at ?? g.updatedAt,
      }));
      console.log('Image generations fetched:', generations.length);
      return { generations, error: null };
    } catch (error) {
      console.error('Error fetching image generations:', error);
      return { generations: [], error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  // Video Generation Methods
  static async createVideoGeneration(params: {
    model: string;
    prompt: string;
    negativePrompt?: string;
    videoId?: string;
    videoUrl?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'moderation_failed';
    errorMessage?: string;
    aspectRatio?: string;
    duration?: number;
    quality?: string;
    motionMode?: string;
    style?: string;
    cameraMovement?: string;
    seed?: number;
    waterMark?: boolean;
    size?: string;
    seconds?: number;
  }): Promise<{ generation: VideoGeneration | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/generations/video`;
      console.log('Creating video generation:', { url, params: { ...params, videoId: params.videoId } });
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', { status: response.status, error: errorData });
        return { generation: null, error: errorData.error || `Failed to create video generation (${response.status})` };
      }

      const data = await response.json();
      console.log('Video generation created successfully:', data.generation?.id);
      return { generation: data.generation, error: null };
    } catch (error) {
      console.error('Error creating video generation:', error);
      return { generation: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async updateVideoGeneration(
    id: string,
    params: {
      videoId?: string;
      videoUrl?: string;
      status?: 'pending' | 'processing' | 'completed' | 'failed' | 'moderation_failed';
      errorMessage?: string;
      isPublic?: boolean;
    }
  ): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/generations/video/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        return { error: errorData.error || `Failed to update video generation (${response.status})` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating video generation:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async deleteVideoGeneration(id: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/generations/video/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: { error?: string };
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        return { error: errorData.error || 'Не удалось удалить генерацию' };
      }
      return { error: null };
    } catch (error) {
      console.error('Error deleting video generation:', error);
      return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  /** Get a signed playback URL for a video (use when public Supabase URL returns 400). */
  static async getVideoPlayUrl(id: string): Promise<{ url: string | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/generations/video/${id}/video`, { headers });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        return { url: null, error: err.error || 'Failed to get playback URL' };
      }
      const data = await response.json();
      return { url: data.url || null, error: null };
    } catch (e) {
      return { url: null, error: e instanceof Error ? e.message : 'Failed to get playback URL' };
    }
  }

  static async uploadVideoToSupabase(
    id: string,
    params: {
      videoUrl?: string;
      videoId?: string;
      isAITunnel?: boolean;
    }
  ): Promise<{ videoUrl: string | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/generations/video/${id}/upload`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        return { videoUrl: null, error: errorData.error || `Failed to upload video (${response.status})` };
      }

      const data = await response.json();
      return { videoUrl: data.videoUrl || null, error: null };
    } catch (error) {
      console.error('Error uploading video to Supabase:', error);
      return { videoUrl: null, error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  static async getUserVideoGenerations(opts?: { limit?: number; offset?: number }): Promise<{ generations: VideoGeneration[]; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (opts?.limit != null) params.set('limit', String(opts.limit));
      if (opts?.offset != null) params.set('offset', String(opts.offset));
      const q = params.toString();
      const url = `${API_BASE_URL}/api/generations/video${q ? `?${q}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', { status: response.status, error: errorData });
        return { generations: [], error: errorData.error || `Failed to fetch video generations (${response.status})` };
      }

      const data = await response.json();
      const raw = data.generations || [];
      // Нормализация: на случай если API вернёт snake_case (video_url и т.д.)
      const generations: VideoGeneration[] = raw.map((g: any) => ({
        ...g,
        userId: g.user_id ?? g.userId,
        negativePrompt: g.negative_prompt ?? g.negativePrompt,
        videoId: g.video_id ?? g.videoId,
        videoUrl: g.video_url ?? g.videoUrl,
        errorMessage: g.error_message ?? g.errorMessage,
        aspectRatio: g.aspect_ratio ?? g.aspectRatio,
        motionMode: g.motion_mode ?? g.motionMode,
        cameraMovement: g.camera_movement ?? g.cameraMovement,
        waterMark: g.water_mark ?? g.waterMark,
        isPublic: g.is_public ?? g.isPublic,
        createdAt: g.created_at ?? g.createdAt,
        updatedAt: g.updated_at ?? g.updatedAt,
      }));
      console.log('Video generations fetched:', generations.length);
      return { generations, error: null };
    } catch (error) {
      console.error('Error fetching video generations:', error);
      return { generations: [], error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  }

  /** Public gallery: generations shared by users (no auth required). Опционально limit, offset для постраничной загрузки. */
  static async getPublicGenerations(opts?: { limit?: number; offset?: number }): Promise<{
    imageGenerations: ImageGeneration[];
    videoGenerations: VideoGeneration[];
    error: string | null;
  }> {
    try {
      const params = new URLSearchParams();
      if (opts?.limit != null) params.set('limit', String(opts.limit));
      if (opts?.offset != null) params.set('offset', String(opts.offset));
      const q = params.toString();
      const response = await fetch(`${API_BASE_URL}/api/generations/public${q ? `?${q}` : ''}`);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        return { imageGenerations: [], videoGenerations: [], error: err.error || 'Failed to load public gallery' };
      }
      const data = await response.json();
      const img = (data.imageGenerations || []).map((g: any) => ({
        ...g,
        userId: g.user_id ?? g.userId,
        negativePrompt: g.negative_prompt ?? g.negativePrompt,
        imageUrls: g.imageUrls ?? (Array.isArray(g.image_urls) ? g.image_urls : []),
        errorMessage: g.error_message ?? g.errorMessage,
        isPublic: true,
        createdAt: g.created_at ?? g.createdAt,
        updatedAt: g.updated_at ?? g.updatedAt,
      }));
      const vid = (data.videoGenerations || []).map((g: any) => ({
        ...g,
        userId: g.user_id ?? g.userId,
        negativePrompt: g.negative_prompt ?? g.negativePrompt,
        videoId: g.video_id ?? g.videoId,
        videoUrl: g.video_url ?? g.videoUrl,
        errorMessage: g.error_message ?? g.errorMessage,
        aspectRatio: g.aspect_ratio ?? g.aspectRatio,
        motionMode: g.motion_mode ?? g.motionMode,
        cameraMovement: g.camera_movement ?? g.cameraMovement,
        waterMark: g.water_mark ?? g.waterMark,
        isPublic: true,
        createdAt: g.created_at ?? g.createdAt,
        updatedAt: g.updated_at ?? g.updatedAt,
      }));
      return { imageGenerations: img, videoGenerations: vid, error: null };
    } catch (e) {
      return {
        imageGenerations: [],
        videoGenerations: [],
        error: e instanceof Error ? e.message : 'Failed to load public gallery',
      };
    }
  }
}

