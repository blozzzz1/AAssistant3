-- Add is_public to image_generations and video_generations
-- Run in Supabase SQL Editor after generations-setup.sql and generations-sql-functions.sql

ALTER TABLE public.image_generations
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.video_generations
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_image_generations_is_public ON public.image_generations(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_video_generations_is_public ON public.video_generations(is_public) WHERE is_public = true;

-- Update image generation: allow updating is_public (DROP old version first)
DROP FUNCTION IF EXISTS update_image_generation(uuid, uuid, jsonb, text, text);
CREATE OR REPLACE FUNCTION update_image_generation(
  p_id UUID,
  p_user_id UUID,
  p_image_urls JSONB DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  model TEXT,
  prompt TEXT,
  negative_prompt TEXT,
  quality TEXT,
  size TEXT,
  output_format TEXT,
  num_images INTEGER,
  image_urls JSONB,
  status TEXT,
  error_message TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.image_generations
  SET
    image_urls = COALESCE(p_image_urls, image_urls),
    status = COALESCE(p_status, status),
    error_message = COALESCE(p_error_message, error_message),
    is_public = COALESCE(p_is_public, is_public),
    updated_at = NOW()
  WHERE image_generations.id = p_id AND image_generations.user_id = p_user_id;
  
  RETURN QUERY
  SELECT 
    ig.id,
    ig.user_id,
    ig.model,
    ig.prompt,
    ig.negative_prompt,
    ig.quality,
    ig.size,
    ig.output_format,
    ig.num_images,
    ig.image_urls,
    ig.status,
    ig.error_message,
    ig.is_public,
    ig.created_at,
    ig.updated_at
  FROM public.image_generations ig
  WHERE ig.id = p_id;
END;
$$;

-- Update video generation: allow updating is_public (DROP old version first)
DROP FUNCTION IF EXISTS update_video_generation(uuid, uuid, text, text, text, text);
CREATE OR REPLACE FUNCTION update_video_generation(
  p_id UUID,
  p_user_id UUID,
  p_video_id TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  model TEXT,
  prompt TEXT,
  negative_prompt TEXT,
  video_id TEXT,
  video_url TEXT,
  status TEXT,
  error_message TEXT,
  aspect_ratio TEXT,
  duration INTEGER,
  quality TEXT,
  motion_mode TEXT,
  style TEXT,
  camera_movement TEXT,
  seed INTEGER,
  water_mark BOOLEAN,
  size TEXT,
  seconds INTEGER,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.video_generations
  SET
    video_id = COALESCE(p_video_id, video_id),
    video_url = COALESCE(p_video_url, video_url),
    status = COALESCE(p_status, status),
    error_message = COALESCE(p_error_message, error_message),
    is_public = COALESCE(p_is_public, is_public),
    updated_at = NOW()
  WHERE video_generations.id = p_id AND video_generations.user_id = p_user_id;
  
  RETURN QUERY
  SELECT 
    vg.id,
    vg.user_id,
    vg.model,
    vg.prompt,
    vg.negative_prompt,
    vg.video_id,
    vg.video_url,
    vg.status,
    vg.error_message,
    vg.aspect_ratio,
    vg.duration,
    vg.quality,
    vg.motion_mode,
    vg.style,
    vg.camera_movement,
    vg.seed,
    vg.water_mark,
    vg.size,
    vg.seconds,
    vg.is_public,
    vg.created_at,
    vg.updated_at
  FROM public.video_generations vg
  WHERE vg.id = p_id;
END;
$$;

-- get_user_image_generations: include is_public (must DROP first when return type changes)
DROP FUNCTION IF EXISTS get_user_image_generations(uuid);
CREATE OR REPLACE FUNCTION get_user_image_generations(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  model TEXT,
  prompt TEXT,
  negative_prompt TEXT,
  quality TEXT,
  size TEXT,
  output_format TEXT,
  num_images INTEGER,
  image_urls JSONB,
  status TEXT,
  error_message TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ig.id,
    ig.user_id,
    ig.model,
    ig.prompt,
    ig.negative_prompt,
    ig.quality,
    ig.size,
    ig.output_format,
    ig.num_images,
    ig.image_urls,
    ig.status,
    ig.error_message,
    ig.is_public,
    ig.created_at,
    ig.updated_at
  FROM public.image_generations ig
  WHERE ig.user_id = p_user_id
  ORDER BY ig.created_at DESC;
END;
$$;

-- get_user_video_generations: include is_public (must DROP first when return type changes)
DROP FUNCTION IF EXISTS get_user_video_generations(uuid);
CREATE OR REPLACE FUNCTION get_user_video_generations(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  model TEXT,
  prompt TEXT,
  negative_prompt TEXT,
  video_id TEXT,
  video_url TEXT,
  status TEXT,
  error_message TEXT,
  aspect_ratio TEXT,
  duration INTEGER,
  quality TEXT,
  motion_mode TEXT,
  style TEXT,
  camera_movement TEXT,
  seed INTEGER,
  water_mark BOOLEAN,
  size TEXT,
  seconds INTEGER,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vg.id,
    vg.user_id,
    vg.model,
    vg.prompt,
    vg.negative_prompt,
    vg.video_id,
    vg.video_url,
    vg.status,
    vg.error_message,
    vg.aspect_ratio,
    vg.duration,
    vg.quality,
    vg.motion_mode,
    vg.style,
    vg.camera_movement,
    vg.seed,
    vg.water_mark,
    vg.size,
    vg.seconds,
    vg.is_public,
    vg.created_at,
    vg.updated_at
  FROM public.video_generations vg
  WHERE vg.user_id = p_user_id
  ORDER BY vg.created_at DESC;
END;
$$;
