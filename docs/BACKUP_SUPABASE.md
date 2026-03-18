# Полный бэкап БД Supabase

Если тарифный план закончится или проект заморозят, автоматические бэкапы на Free-тарифе **не делаются**. Ниже — как сохранить копию БД и, при необходимости, Storage.

## 1. Откуда взять строку подключения к БД

1. Открой [Supabase Dashboard](https://supabase.com/dashboard) → свой проект.
2. **Project Settings** (иконка шестерёнки) → **Database**.
3. В блоке **Connection string** выбери вкладку **URI**.
4. Скопируй строку вида:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-xx-x.pooler.supabase.com:6543/postgres
   ```
5. Подставь **реальный пароль** БД вместо `[YOUR-PASSWORD]`.  
   Если пароль забыт: в том же разделе **Database** есть **Reset database password**.

Пароль и URI **не коммить** в репозиторий. Храни их только в `.env` или в секретном месте.

---

## 2. Бэкап только БД (pg_dump)

### Установка pg_dump (если ещё нет)

- **Windows**: установи [PostgreSQL](https://www.postgresql.org/download/windows/) или только [Command Line Tools](https://www.postgresql.org/download/windows/) — в комплекте есть `pg_dump`.
- **macOS**: `brew install libpq` и в PATH добавь `$(brew --prefix libpq)/bin`, либо установи полный Postgres.
- **Linux**: `sudo apt install postgresql-client` (или аналог для дистрибутива).

### Только схема (таблицы, без данных)

Если нужны только структура таблиц, функции, RLS и т.п. — без строк данных:

```bash
pg_dump "postgresql://..." --schema-only --no-owner --no-acl -F p -f schema_only.sql
```

Или через скрипт (Windows): `.\backend\scripts\backup-db.ps1 -SchemaOnly`

### Полный бэкап (схема + данные)

Подставь свою строку подключения и путь к файлу бэкапа:

```bash
pg_dump "postgresql://postgres.XXXX:ПАРОЛЬ@aws-0-xx-x.pooler.supabase.com:6543/postgres" --no-owner --no-acl -F p -f backup_$(date +%Y%m%d_%H%M).sql
```

- `-F p` — текстовый SQL (удобно хранить и смотреть).
- `--no-owner --no-acl` — не экспортировать владельцев/права (проще восстанавливать в другом проекте).

Сжатый бэкап (меньше места):

```bash
pg_dump "postgresql://..." --no-owner --no-acl -F c -f backup_$(date +%Y%m%d_%H%M).dump
```

Восстановление из `.sql` (и полного, и schema-only):

```bash
psql "postgresql://..." -f backup_20250225_120000.sql
```

Восстановление из `.dump`:

```bash
pg_restore -d "postgresql://..." --no-owner --no-acl backup_20250225_120000.dump
```

---

## 3. Через Supabase CLI (альтернатива)

Если установлен [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase db dump --db-url "postgresql://..." -f backup.sql
```

Тот же `postgresql://...` URI из раздела 1.

---

## 4. Storage (файлы в бакетах)

В бэкапах Supabase **есть только БД**. Объекты Storage (картинки, видео и т.д.) в дамп **не входят**.

Чтобы не потерять файлы при окончании тарифа:

1. В Dashboard: **Storage** → нужный bucket → скачивай важные объекты вручную или через API.
2. Можно написать скрипт на Node/Python, который через Supabase Storage API перечисляет объекты и скачивает их к себе (например, в папку `backup_storage/`).

Метаданные о файлах (пути, имена) могут храниться в БД — они попадут в дамп из пункта 2.

---

## 5. Рекомендации

- Делай дамп **регулярно** (раз в неделю/месяц) и храни копии в надёжном месте (другой диск, облако).
- Храни строку подключения и пароль только в `backend/.env` (файл в `.gitignore`) или в секретах, не в коде.
- Перед окончанием тарифа: сделай свежий `pg_dump` и сохрани файлы из Storage отдельно.

Скрипт `backend/scripts/backup-db.ps1` использует переменную `DATABASE_URL` из `backend/.env` — добавь её по инструкции в скрипте.
