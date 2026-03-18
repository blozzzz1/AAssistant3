import { supabaseAdmin } from '../config/supabase';

const VIDEO_BUCKET_NAME = 'videos';

export class StorageService {
  /**
   * Uploads a video file to Supabase Storage
   * @param videoBlob - The video file as a Blob or Buffer
   * @param userId - The user ID who owns the video
   * @param videoId - The video generation ID (for unique naming)
   * @returns The public URL of the uploaded video
   */
  static async uploadVideo(
    videoBlob: Blob | Buffer | ArrayBuffer,
    userId: string,
    videoId: string
  ): Promise<{ url: string; error: string | null }> {
    try {
      // Ensure bucket exists (create if not exists)
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return { url: '', error: `Failed to check buckets: ${bucketsError.message}` };
      }

      const bucketExists = buckets?.some(bucket => bucket.name === VIDEO_BUCKET_NAME);
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabaseAdmin.storage.createBucket(VIDEO_BUCKET_NAME, {
          public: true, // Make videos publicly accessible
          fileSizeLimit: 100 * 1024 * 1024, // 100MB limit
          allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
          return { url: '', error: `Failed to create bucket: ${createError.message}` };
        }
      }

      // Generate unique file path: videos/{userId}/{videoId}.mp4
      const filePath = `${userId}/${videoId}.mp4`;

      // Convert Blob to Buffer if needed (for Node.js compatibility)
      let videoBuffer: Buffer;
      if (Buffer.isBuffer(videoBlob)) {
        videoBuffer = videoBlob;
      } else if (videoBlob instanceof ArrayBuffer) {
        videoBuffer = Buffer.from(videoBlob);
      } else {
        // Blob - convert to Buffer (check if it's a Blob-like object)
        const blob = videoBlob as any;
        if (blob.arrayBuffer && typeof blob.arrayBuffer === 'function') {
          const arrayBuffer = await blob.arrayBuffer();
          videoBuffer = Buffer.from(arrayBuffer);
        } else if (blob.buffer) {
          videoBuffer = Buffer.from(blob.buffer);
        } else {
          return { url: '', error: 'Unsupported video blob type' };
        }
      }

      // Upload video
      const { data, error } = await supabaseAdmin.storage
        .from(VIDEO_BUCKET_NAME)
        .upload(filePath, videoBuffer, {
          contentType: 'video/mp4',
          upsert: true, // Overwrite if exists
        });

      if (error) {
        console.error('Error uploading video:', error);
        return { url: '', error: `Failed to upload video: ${error.message}` };
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(VIDEO_BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return { url: '', error: 'Failed to get public URL' };
      }

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Unexpected error in uploadVideo:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  }

  /**
   * Downloads a video from an external URL and uploads it to Supabase Storage
   * @param videoUrl - The external video URL
   * @param userId - The user ID who owns the video
   * @param videoId - The video generation ID (for unique naming)
   * @returns The public URL of the uploaded video
   */
  static async downloadAndUploadVideo(
    videoUrl: string,
    userId: string,
    videoId: string
  ): Promise<{ url: string; error: string | null }> {
    try {
      // Download video from external URL
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        return { url: '', error: `Failed to download video: ${response.status} ${response.statusText}` };
      }

      const videoBlob = await response.blob();
      
      // Upload to Supabase
      return await this.uploadVideo(videoBlob, userId, videoId);
    } catch (error) {
      console.error('Error in downloadAndUploadVideo:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Failed to download and upload video',
      };
    }
  }

  /**
   * Downloads a video from AITunnel API (requires authentication) and uploads to Supabase
   * @param videoId - The AITunnel video ID
   * @param apiKey - The AITunnel API key
   * @param userId - The user ID who owns the video
   * @param generationId - The video generation ID (for unique naming)
   * @returns The public URL of the uploaded video
   */
  static async downloadAITunnelVideoAndUpload(
    videoId: string,
    apiKey: string,
    userId: string,
    generationId: string
  ): Promise<{ url: string; error: string | null }> {
    try {
      // Normalize video ID (AITunnel expects video_...)
      if (!videoId.startsWith('video_')) {
        return {
          url: '',
          error:
            `Invalid AITunnel videoId '${videoId}'. Expected id that begins with 'video_'. ` +
            `Re-generate the video to get a fresh AITunnel id.`,
        };
      }
      let apiVideoId = videoId;
      let response = await fetch(`https://api.aitunnel.ru/v1/videos/${apiVideoId}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      // Для некоторых моделей (например wan2.6) AITunnel возвращает id без префикса; по video_... отдаёт 404
      if (!response.ok && videoId.startsWith('video_')) {
        const withoutPrefix = videoId.slice('video_'.length);
        response = await fetch(`https://api.aitunnel.ru/v1/videos/${withoutPrefix}/content`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) apiVideoId = withoutPrefix;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return { url: '', error: `Failed to download from AITunnel: ${response.status} ${errorText}` };
      }

      const videoBlob = await response.blob();
      
      // Upload to Supabase
      return await this.uploadVideo(videoBlob, userId, generationId);
    } catch (error) {
      console.error('Error in downloadAITunnelVideoAndUpload:', error);
      return {
        url: '',
        error: error instanceof Error ? error.message : 'Failed to download and upload AITunnel video',
      };
    }
  }

  /**
   * Creates a signed URL for a video in Storage (works even when bucket public URL returns 400).
   * @param filePath - Path in bucket, e.g. "userId/videoId.mp4"
   * @param expiresInSeconds - URL validity in seconds (default 1 hour)
   */
  static async createSignedVideoUrl(
    filePath: string,
    expiresInSeconds: number = 3600
  ): Promise<{ url: string; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(VIDEO_BUCKET_NAME)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        console.error('Error creating signed URL:', error);
        return { url: '', error: error.message };
      }
      if (!data?.signedUrl) {
        return { url: '', error: 'Failed to create signed URL' };
      }
      return { url: data.signedUrl, error: null };
    } catch (err) {
      console.error('Unexpected error in createSignedVideoUrl:', err);
      return {
        url: '',
        error: err instanceof Error ? err.message : 'Unexpected error',
      };
    }
  }

  /**
   * Deletes a video from Supabase Storage
   * @param userId - The user ID who owns the video
   * @param videoId - The video generation ID
   */
  static async deleteVideo(userId: string, videoId: string): Promise<{ error: string | null }> {
    try {
      const filePath = `${userId}/${videoId}.mp4`;
      
      const { error } = await supabaseAdmin.storage
        .from(VIDEO_BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting video:', error);
        return { error: `Failed to delete video: ${error.message}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error in deleteVideo:', error);
      return {
        error: error instanceof Error ? error.message : 'Unexpected error occurred',
      };
    }
  }
}
