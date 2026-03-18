-- SQL функции для обхода RLS при использовании Service Role Key
-- Выполните эти функции в Supabase SQL Editor

-- Функция для создания сессии (обходит RLS)
CREATE OR REPLACE FUNCTION create_chat_session(
  p_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_selected_model TEXT,
  p_messages JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  selected_model TEXT,
  messages JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Это позволяет функции выполняться с правами создателя, обходя RLS
AS $$
BEGIN
  INSERT INTO public.chat_sessions (
    id,
    user_id,
    title,
    selected_model,
    messages,
    created_at,
    updated_at
  )
  VALUES (
    p_id,
    p_user_id,
    p_title,
    p_selected_model,
    p_messages,
    NOW(),
    NOW()
  );
  
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.selected_model,
    cs.messages,
    cs.created_at,
    cs.updated_at
  FROM public.chat_sessions cs
  WHERE cs.id = p_id;
END;
$$;

-- Функция для обновления сессии (обходит RLS)
CREATE OR REPLACE FUNCTION update_chat_session(
  p_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_selected_model TEXT,
  p_messages JSONB
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  selected_model TEXT,
  messages JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.chat_sessions
  SET
    title = p_title,
    selected_model = p_selected_model,
    messages = p_messages,
    updated_at = NOW()
  WHERE chat_sessions.id = p_id AND chat_sessions.user_id = p_user_id;
  
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.selected_model,
    cs.messages,
    cs.created_at,
    cs.updated_at
  FROM public.chat_sessions cs
  WHERE cs.id = p_id;
END;
$$;

-- Функция для получения всех сессий пользователя (обходит RLS)
CREATE OR REPLACE FUNCTION get_user_chat_sessions(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  selected_model TEXT,
  messages JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.selected_model,
    cs.messages,
    cs.created_at,
    cs.updated_at
  FROM public.chat_sessions cs
  WHERE cs.user_id = p_user_id
  ORDER BY cs.updated_at DESC;
END;
$$;

-- Функция для получения конкретной сессии (обходит RLS)
CREATE OR REPLACE FUNCTION get_chat_session(
  p_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  selected_model TEXT,
  messages JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.user_id,
    cs.title,
    cs.selected_model,
    cs.messages,
    cs.created_at,
    cs.updated_at
  FROM public.chat_sessions cs
  WHERE cs.id = p_id AND cs.user_id = p_user_id;
END;
$$;

-- Функция для удаления сессии (обходит RLS)
CREATE OR REPLACE FUNCTION delete_chat_session(
  p_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.chat_sessions
  WHERE chat_sessions.id = p_id AND chat_sessions.user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

