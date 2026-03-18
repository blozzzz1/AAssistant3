# Исправление ошибок RLS в бэкенде

## Проблема

При использовании Service Role Key все еще возникают ошибки RLS (Row Level Security):
```
Error: new row violates row-level security policy for table "chat_sessions"
```

## Решение

Service Role Key должен автоматически обходить RLS, но иногда это не работает. Для надежности созданы SQL функции с `SECURITY DEFINER`, которые гарантированно обходят RLS.

## Шаги для исправления

### 1. Выполните SQL функции в Supabase

Откройте Supabase Dashboard → SQL Editor и выполните содержимое файла `backend-sql-functions.sql`.

Эти функции создадут RPC endpoints, которые обходят RLS:
- `create_chat_session` - создание сессии
- `update_chat_session` - обновление сессии
- `get_user_chat_sessions` - получение всех сессий пользователя
- `get_chat_session` - получение конкретной сессии
- `delete_chat_session` - удаление сессии

### 2. Проверьте Service Role Key

Убедитесь, что в файле `backend/.env` используется правильный **Service Role Key**, а не Anon Key:

1. Откройте Supabase Dashboard → Settings → API
2. Найдите **service_role** key (он намного длиннее anon key)
3. Скопируйте его в `backend/.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (очень длинный ключ)
   ```

### 3. Перезапустите бэкенд

После выполнения SQL функций перезапустите бэкенд:
```bash
cd backend
npm run dev
```

## Альтернативное решение (если SQL функции не работают)

Если проблемы продолжаются, можно временно отключить RLS для тестирования (НЕ рекомендуется для продакшена):

```sql
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
```

Но лучше использовать SQL функции с `SECURITY DEFINER`, так как они безопаснее.

## Проверка

После выполнения SQL функций и перезапуска бэкенда, попробуйте создать новую сессию чата. Ошибки RLS должны исчезнуть.

## Примечание о Site URL

Site URL в настройках Supabase (`http://localhost:3000`) не влияет на RLS ошибки. Это настройка только для редиректов при аутентификации. Вы можете оставить ее как есть или изменить на `http://localhost:5173` (порт вашего фронтенда).


