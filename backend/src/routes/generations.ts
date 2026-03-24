import { Router, Response } from 'express';
import { z } from 'zod';
import { GenerationService } from '../services/generationService';
import { StorageService } from '../services/storageService';
import { PlanService } from '../services/planService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { AdminService } from '../services/adminService';
import { validateRequest } from '../middleware/validate';

const router = Router();
const idParamsSchema = z.object({
  id: z.string().uuid(),
});

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const createImageBodySchema = z.object({
  model: z.string().trim().min(1).max(150),
  prompt: z.string().trim().min(1).max(4000),
  negativePrompt: z.string().max(2000).optional(),
  quality: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  outputFormat: z.string().max(30).optional(),
  numImages: z.number().int().min(1).max(10).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  errorMessage: z.string().max(2000).optional(),
});

const updateImageBodySchema = z.object({
  imageUrls: z.array(z.string().url()).max(10).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  errorMessage: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field must be provided',
});

const createVideoBodySchema = z.object({
  model: z.string().trim().min(1).max(150),
  prompt: z.string().trim().min(1).max(4000),
  negativePrompt: z.string().max(2000).optional(),
  videoId: z.string().max(200).optional(),
  videoUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'moderation_failed']).optional(),
  errorMessage: z.string().max(2000).optional(),
  aspectRatio: z.string().max(50).optional(),
  duration: z.number().int().min(1).max(60).optional(),
  quality: z.string().max(100).optional(),
  motionMode: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
  cameraMovement: z.string().max(100).optional(),
  seed: z.number().int().optional(),
  waterMark: z.boolean().optional(),
  size: z.string().max(50).optional(),
  seconds: z.number().int().min(1).max(60).optional(),
});

const updateVideoBodySchema = z.object({
  videoId: z.string().max(200).optional(),
  videoUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'moderation_failed']).optional(),
  errorMessage: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field must be provided',
});

const uploadVideoBodySchema = z.object({
  videoUrl: z.string().url().optional(),
  videoId: z.string().max(200).optional(),
  isAITunnel: z.boolean().optional(),
}).refine((payload) => Boolean(payload.videoUrl || (payload.isAITunnel && payload.videoId)), {
  message: 'videoUrl or (videoId and isAITunnel) is required',
});

// Public gallery: generations shared by users (no auth required). Query: limit, offset.
router.get('/public', validateRequest({ query: listQuerySchema }), async (req, res: Response) => {
  try {
    const limit = req.query.limit != null ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;
    const offset = req.query.offset != null ? Math.max(0, Number(req.query.offset)) : undefined;
    const { imageGenerations, videoGenerations, error } = await GenerationService.getPublicGenerations(
      [limit, offset].some((x) => x !== undefined) ? { limit, offset } : undefined
    );
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ imageGenerations, videoGenerations });
  } catch (error) {
    console.error('Error in GET /public:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// All routes below require authentication
router.use(authenticateToken);

// Image Generation Routes
// GET /api/generations/image - Get all user image generations
router.get('/image', validateRequest({ query: listQuerySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit != null ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;
    const offset = req.query.offset != null ? Math.max(0, Number(req.query.offset)) : undefined;
    const opts = [limit, offset].some((x) => x !== undefined) ? { limit, offset } : undefined;
    const { generations, error } = await GenerationService.getUserImageGenerations(req.userId!, opts);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ generations });
  } catch (error) {
    console.error('Error in GET /image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/generations/image - Create new image generation
router.post('/image', validateRequest({ body: createImageBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { allowed, limit, current, error: limitError } = await PlanService.checkImageLimit(req.userId);
    if (limitError) {
      res.status(500).json({ error: limitError });
      return;
    }
    if (!allowed) {
      res.status(403).json({
        error: `Дневной лимит изображений (${limit}) исчерпан. Перейдите на Премиум для безлимитной генерации.`,
        code: 'IMAGE_LIMIT_EXCEEDED',
        limit,
        current,
      });
      return;
    }

    const {
      model,
      prompt,
      negativePrompt,
      quality,
      size,
      outputFormat,
      numImages,
      imageUrls,
      status,
      errorMessage,
    } = req.body;

    const { generation, error } = await GenerationService.createImageGeneration(req.userId, {
      model,
      prompt,
      negativePrompt,
      quality,
      size,
      outputFormat,
      numImages,
      imageUrls,
      status,
      errorMessage,
    });

    if (error || !generation) {
      res.status(500).json({ error: error || 'Failed to create image generation' });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'image_generation_created',
      { generationId: generation.id, model, prompt: prompt.substring(0, 100), quality, size, numImages },
      ipAddress,
      userAgent
    );

    res.status(201).json({ generation });
  } catch (error) {
    console.error('Error in POST /image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/generations/image/:id - Update image generation
router.put('/image/:id', validateRequest({ params: idParamsSchema, body: updateImageBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { imageUrls, status, errorMessage, isPublic } = req.body;

    const { error } = await GenerationService.updateImageGeneration(id, req.userId, {
      imageUrls,
      status,
      errorMessage,
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
    });

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity if status changed to completed
    if (status === 'completed') {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await AdminService.logActivity(
        req.userId!,
        'image_generation_completed',
        { generationId: id, imageCount: imageUrls?.length || 0 },
        ipAddress,
        userAgent
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /image/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/generations/image/:id - Delete image generation (own only)
router.delete('/image/:id', validateRequest({ params: idParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const { error } = await GenerationService.deleteImageGeneration(id, req.userId);
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /image/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Video Generation Routes
// GET /api/generations/video - Get all user video generations
router.get('/video', validateRequest({ query: listQuerySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit != null ? Math.min(100, Math.max(1, Number(req.query.limit))) : undefined;
    const offset = req.query.offset != null ? Math.max(0, Number(req.query.offset)) : undefined;
    const opts = [limit, offset].some((x) => x !== undefined) ? { limit, offset } : undefined;
    const { generations, error } = await GenerationService.getUserVideoGenerations(req.userId!, opts);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ generations });
  } catch (error) {
    console.error('Error in GET /video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/generations/video - Create new video generation
router.post('/video', validateRequest({ body: createVideoBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { allowed, limit, current, error: limitError } = await PlanService.checkVideoLimit(req.userId);
    if (limitError) {
      res.status(500).json({ error: limitError });
      return;
    }
    if (!allowed) {
      res.status(403).json({
        error: `Дневной лимит видео (${limit}) исчерпан. Перейдите на Премиум для безлимитной генерации.`,
        code: 'VIDEO_LIMIT_EXCEEDED',
        limit,
        current,
      });
      return;
    }

    const {
      model,
      prompt,
      negativePrompt,
      videoId,
      videoUrl,
      status,
      errorMessage,
      aspectRatio,
      duration,
      quality,
      motionMode,
      style,
      cameraMovement,
      seed,
      waterMark,
      size,
      seconds,
    } = req.body;

    const { generation, error } = await GenerationService.createVideoGeneration(req.userId, {
      model,
      prompt,
      negativePrompt,
      videoId,
      videoUrl,
      status,
      errorMessage,
      aspectRatio,
      duration,
      quality,
      motionMode,
      style,
      cameraMovement,
      seed,
      waterMark,
      size,
      seconds,
    });

    if (error || !generation) {
      res.status(500).json({ error: error || 'Failed to create video generation' });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'video_generation_created',
      { generationId: generation.id, model, prompt: prompt.substring(0, 100), duration, quality, aspectRatio },
      ipAddress,
      userAgent
    );

    res.status(201).json({ generation });
  } catch (error) {
    console.error('Error in POST /video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/generations/video/:id - Update video generation
router.put('/video/:id', validateRequest({ params: idParamsSchema, body: updateVideoBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { videoId, videoUrl, status, errorMessage, isPublic } = req.body;

    const { error } = await GenerationService.updateVideoGeneration(id, req.userId, {
      videoId,
      videoUrl,
      status,
      errorMessage,
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
    });

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity if status changed to completed
    if (status === 'completed') {
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await AdminService.logActivity(
        req.userId!,
        'video_generation_completed',
        { generationId: id, videoUrl: videoUrl ? 'uploaded' : null },
        ipAddress,
        userAgent
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /video/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/generations/video/:id - Delete video generation (own only)
router.delete('/video/:id', validateRequest({ params: idParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const { error } = await GenerationService.deleteVideoGeneration(id, req.userId);
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /video/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/generations/video/:id/upload - Upload video to Supabase Storage
router.post('/video/:id/upload', validateRequest({ params: idParamsSchema, body: uploadVideoBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { videoUrl, videoId, isAITunnel } = req.body;

    // Get the generation to verify ownership
    const { generations, error: fetchError } = await GenerationService.getUserVideoGenerations(req.userId);
    if (fetchError) {
      res.status(500).json({ error: fetchError });
      return;
    }

    const generation = generations.find(g => g.id === id);
    if (!generation) {
      res.status(404).json({ error: 'Video generation not found' });
      return;
    }

    let supabaseUrl: string;
    let uploadError: string | null = null;

    if (isAITunnel && videoId) {
      // Download from AITunnel and upload to Supabase (key from server env)
      const aitunnelKey = process.env.AITUNNEL_API_KEY;
      if (!aitunnelKey) {
        res.status(500).json({ error: 'AITUNNEL_API_KEY is not configured on server' });
        return;
      }
      const result = await StorageService.downloadAITunnelVideoAndUpload(
        videoId,
        aitunnelKey,
        req.userId,
        id
      );
      supabaseUrl = result.url;
      uploadError = result.error;
    } else if (videoUrl) {
      // Download from external URL and upload to Supabase
      const result = await StorageService.downloadAndUploadVideo(
        videoUrl,
        req.userId,
        id
      );
      supabaseUrl = result.url;
      uploadError = result.error;
    } else {
      res.status(400).json({ error: 'videoUrl or (videoId and isAITunnel for AITunnel) is required' });
      return;
    }

    if (uploadError || !supabaseUrl) {
      res.status(500).json({ error: uploadError || 'Failed to upload video to Supabase' });
      return;
    }

    // Update generation with Supabase URL
    const { error: updateError } = await GenerationService.updateVideoGeneration(id, req.userId, {
      videoUrl: supabaseUrl,
    });

    if (updateError) {
      res.status(500).json({ error: updateError });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'video_uploaded_to_storage',
      { generationId: id, storageUrl: supabaseUrl },
      ipAddress,
      userAgent
    );

    res.json({ success: true, videoUrl: supabaseUrl });
  } catch (error) {
    console.error('Error in POST /video/:id/upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/generations/video/:id/video - Get signed URL for video playback (avoids 400 on public URL)
router.get('/video/:id/video', validateRequest({ params: idParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { generation, error: fetchError } = await GenerationService.getVideoGenerationById(id, req.userId);

    if (fetchError) {
      res.status(500).json({ error: fetchError });
      return;
    }
    if (!generation) {
      res.status(404).json({ error: 'Video generation not found' });
      return;
    }
    if (!generation.videoUrl) {
      res.status(404).json({ error: 'Video not yet available' });
      return;
    }

    const filePath = `${generation.userId}/${id}.mp4`;
    const { url: signedUrl, error: signError } = await StorageService.createSignedVideoUrl(filePath, 3600);

    if (signError || !signedUrl) {
      res.status(500).json({ error: signError || 'Failed to create playback URL' });
      return;
    }

    res.json({ url: signedUrl });
  } catch (error) {
    console.error('Error in GET /video/:id/video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

