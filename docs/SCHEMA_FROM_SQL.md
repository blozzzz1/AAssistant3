# Восстановление схемы БД из SQL-файлов проекта

Да, **достаточно последовательно выполнить все SQL-файлы** — получится полная схема (таблицы, RLS, функции). Порядок важен: сначала таблицы и триггеры, потом функции, которые на них ссылаются.

## Рекомендуемый порядок

Выполняй в **Supabase → SQL Editor** (или через `psql`) в таком порядке:

| № | Файл | Что создаёт |
|---|------|-------------|
| 1 | `supabase-setup.sql` | `chat_sessions`, функция `update_updated_at_column`, RLS |
| 2 | `generations-setup.sql` | `image_generations`, `video_generations`, RLS, триггеры |
| 3 | `backend/migrations/system_settings.sql` | `system_settings` + начальные значения |
| 4 | `backend/migrations/model_settings.sql` | `model_settings` |
| 5 | `backend/migrations/user_plans.sql` | `user_plans` |
| 6 | `admin-setup.sql` | `admins`, `user_blocks`, `user_activity_log` (и доп. функции админки) |
| 7 | `backend-sql-functions.sql` | RPC для чата (`create_chat_session`, `get_user_chat_sessions` и т.д.) |
| 8 | `generations-sql-functions.sql` | RPC для изображений и видео |
| 9 | `generations-add-is-public.sql` | колонки `is_public` + обновлённые RPC под них (выполнять после п.8) |
| 10 | `create-super-admin.sql` | при необходимости — первый супер-админ |
| 11 | `backend/migrations/model_settings_seed.sql` | при необходимости — начальные записи в `model_settings` |
| 12 | `supabase-delete-user-function.sql` | при необходимости — функция удаления пользователя |

Если используешь только часть функционала (например, без админки), можно не запускать `admin-setup.sql` и `create-super-admin.sql`.

## Одной командой (psql)

Из корня проекта, с подставленным `DATABASE_URL`:

```bash
# Windows (PowerShell)
$env:PGPASSWORD="твой_пароль"
psql "postgresql://postgres.xxxx@...pooler.supabase.com:6543/postgres" -f supabase-setup.sql
psql "postgresql://..." -f generations-setup.sql
psql "postgresql://..." -f backend/migrations/system_settings.sql
psql "postgresql://..." -f backend/migrations/model_settings.sql
psql "postgresql://..." -f backend/migrations/user_plans.sql
psql "postgresql://..." -f admin-setup.sql
psql "postgresql://..." -f backend-sql-functions.sql
psql "postgresql://..." -f generations-sql-functions.sql
psql "postgresql://..." -f generations-add-is-public.sql
# опционально: create-super-admin.sql, model_settings_seed.sql, supabase-delete-user-function.sql
```

Либо один раз подключиться к БД и выполнять по очереди: `\i supabase-setup.sql` и т.д.

## Важно

- Это воссоздаёт **только схему** (структуру). Данных в таблицах не будет — только пустые таблицы, политики и функции.
- В новом проекте Supabase уже есть `auth.users`; все ссылки на `auth.users(id)` будут работать после создания таблиц.
- Если какой-то объект уже существует, в скриптах используется `CREATE TABLE IF NOT EXISTS` / `CREATE OR REPLACE FUNCTION`, поэтому повторный запуск обычно безопасен (кроме миграций с `DROP`).

Итого: да, запуск всех этих SQL-файлов в указанном порядке достаточен, чтобы получить полную схему БД без данных.
