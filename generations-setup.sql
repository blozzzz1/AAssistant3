-- Create image_generations table
CREATE TABLE IF NOT EXISTS public.image_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    quality TEXT,
    size TEXT,
    output_format TEXT,
    num_images INTEGER DEFAULT 1,
    image_urls JSONB DEFAULT '[]'::jsonb, -- Array of image URLs or base64 data URLs
    status TEXT DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_generations table
CREATE TABLE IF NOT EXISTS public.video_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    video_id TEXT, -- External API video ID
    video_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'moderation_failed'
    error_message TEXT,
    -- Video generation parameters
    aspect_ratio TEXT, -- Deprecated, kept for backward compatibility
    duration INTEGER,
    quality TEXT, -- Deprecated, kept for backward compatibility
    motion_mode TEXT, -- Deprecated, kept for backward compatibility
    style TEXT,
    camera_movement TEXT,
    seed INTEGER,
    water_mark BOOLEAN DEFAULT false,
    -- AITunnel specific parameters
    size TEXT,
    seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_image_generations_user_id ON public.image_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON public.image_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_generations_user_id ON public.video_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON public.video_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_generations_video_id ON public.video_generations(video_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;

-- Create policies for image_generations
-- Users can only see their own image generations
CREATE POLICY "Users can view own image generations"
    ON public.image_generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own image generations
CREATE POLICY "Users can insert own image generations"
    ON public.image_generations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own image generations
CREATE POLICY "Users can update own image generations"
    ON public.image_generations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own image generations
CREATE POLICY "Users can delete own image generations"
    ON public.image_generations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for video_generations
-- Users can only see their own video generations
CREATE POLICY "Users can view own video generations"
    ON public.video_generations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own video generations
CREATE POLICY "Users can insert own video generations"
    ON public.video_generations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own video generations
CREATE POLICY "Users can update own video generations"
    ON public.video_generations
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own video generations
CREATE POLICY "Users can delete own video generations"
    ON public.video_generations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at on image_generations
CREATE TRIGGER update_image_generations_updated_at 
    BEFORE UPDATE ON public.image_generations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on video_generations
CREATE TRIGGER update_video_generations_updated_at 
    BEFORE UPDATE ON public.video_generations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

