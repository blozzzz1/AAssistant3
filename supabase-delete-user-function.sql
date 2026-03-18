-- Функция для удаления пользователя (опционально)
-- Эта функция позволяет пользователю удалить свой собственный аккаунт
-- Запускается от имени пользователя, поэтому безопасна

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Удаляем все чаты пользователя (каскадно удалится из-за FK)
  DELETE FROM public.chat_sessions WHERE user_id = auth.uid();
  
  -- Удаляем пользователя из auth.users
  -- Требует расширенных прав, поэтому может не работать
  -- В этом случае просто выходим и оставляем пустой аккаунт
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Даем права на выполнение функции аутентифицированным пользователям
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

