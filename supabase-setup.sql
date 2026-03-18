-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    selected_model TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own chat sessions
CREATE POLICY "Users can view own chat sessions"
    ON public.chat_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own chat sessions
CREATE POLICY "Users can insert own chat sessions"
    ON public.chat_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own chat sessions
CREATE POLICY "Users can update own chat sessions"
    ON public.chat_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own chat sessions
CREATE POLICY "Users can delete own chat sessions"
    ON public.chat_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON public.chat_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

