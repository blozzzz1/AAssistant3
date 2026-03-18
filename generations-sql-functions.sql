-- SQL функции для работы с историей генераций (обходит RLS)
-- Выполните эти функции в Supabase SQL Editor

-- Функция для создания записи генерации изображения (обходит RLS)
CREATE OR REPLACE FUNCTION create_image_generation(
  p_id UUID,
  p_user_id UUID,
  p_model TEXT,
  p_prompt TEXT,
  p_negative_prompt TEXT DEFAULT NULL,
  p_quality TEXT DEFAULT NULL,
  p_size TEXT DEFAULT NULL,
  p_output_format TEXT DEFAULT NULL,
  p_num_images INTEGER DEFAULT 1,
  p_image_urls JSONB DEFAULT '[]'::jsonb,
  p_status TEXT DEFAULT 'completed',
  p_error_message TEXT DEFAULT NULL
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
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.image_generations (
    id,
    user_id,
    model,
    prompt,
    negative_prompt,
    quality,
    size,
    output_format,
    num_images,
    image_urls,
    status,
    error_message,
    created_at,
    updated_at
  )
  VALUES (
    p_id,
    p_user_id,
    p_model,
    p_prompt,
    p_negative_prompt,
    p_quality,
    p_size,
    p_output_format,
    p_num_images,
    p_image_urls,
    p_status,
    p_error_message,
    NOW(),
    NOW()
  );
  
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
    ig.created_at,
    ig.updated_at
  FROM public.image_generations ig
  WHERE ig.id = p_id;
END;
$$;

-- Функция для обновления записи генерации изображения (обходит RLS)
CREATE OR REPLACE FUNCTION update_image_generation(
  p_id UUID,
  p_user_id UUID,
  p_image_urls JSONB DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
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
    ig.created_at,
    ig.updated_at
  FROM public.image_generations ig
  WHERE ig.id = p_id;
END;
$$;

-- Функция для создания записи генерации видео (обходит RLS)
CREATE OR REPLACE FUNCTION create_video_generation(
  p_id UUID,
  p_user_id UUID,
  p_model TEXT,
  p_prompt TEXT,
  p_negative_prompt TEXT DEFAULT NULL,
  p_video_id TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'pending',
  p_error_message TEXT DEFAULT NULL,
  p_aspect_ratio TEXT DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_quality TEXT DEFAULT NULL,
  p_motion_mode TEXT DEFAULT NULL,
  p_style TEXT DEFAULT NULL,
  p_camera_movement TEXT DEFAULT NULL,
  p_seed INTEGER DEFAULT NULL,
  p_water_mark BOOLEAN DEFAULT false,
  p_size TEXT DEFAULT NULL,
  p_seconds INTEGER DEFAULT NULL
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
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.video_generations (
    id,
    user_id,
    model,
    prompt,
    negative_prompt,
    video_id,
    video_url,
    status,
    error_message,
    aspect_ratio,
    duration,
    quality,
    motion_mode,
    style,
    camera_movement,
    seed,
    water_mark,
    size,
    seconds,
    created_at,
    updated_at
  )
  VALUES (
    p_id,
    p_user_id,
    p_model,
    p_prompt,
    p_negative_prompt,
    p_video_id,
    p_video_url,
    p_status,
    p_error_message,
    p_aspect_ratio,
    p_duration,
    p_quality,
    p_motion_mode,
    p_style,
    p_camera_movement,
    p_seed,
    p_water_mark,
    p_size,
    p_seconds,
    NOW(),
    NOW()
  );
  
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
    vg.created_at,
    vg.updated_at
  FROM public.video_generations vg
  WHERE vg.id = p_id;
END;
$$;

-- Функция для обновления записи генерации видео (обходит RLS)
CREATE OR REPLACE FUNCTION update_video_generation(
  p_id UUID,
  p_user_id UUID,
  p_video_id TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
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
    vg.created_at,
    vg.updated_at
  FROM public.video_generations vg
  WHERE vg.id = p_id;
END;
$$;

-- Функция для получения всех генераций изображений пользователя (обходит RLS)
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
    ig.created_at,
    ig.updated_at
  FROM public.image_generations ig
  WHERE ig.user_id = p_user_id
  ORDER BY ig.created_at DESC;
END;
$$;

-- Функция для получения всех генераций видео пользователя (обходит RLS)
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
    vg.created_at,
    vg.updated_at
  FROM public.video_generations vg
  WHERE vg.user_id = p_user_id
  ORDER BY vg.created_at DESC;
END;
$$;

-- Функция для удаления генерации изображения (обходит RLS)
CREATE OR REPLACE FUNCTION delete_image_generation(
  p_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.image_generations
  WHERE image_generations.id = p_id AND image_generations.user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Функция для удаления генерации видео (обходит RLS)
CREATE OR REPLACE FUNCTION delete_video_generation(
  p_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.video_generations
  WHERE video_generations.id = p_id AND video_generations.user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

