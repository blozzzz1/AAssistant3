# Настройка истории генераций

Эта инструкция поможет вам настроить сохранение истории генераций изображений и видео в базе данных Supabase.

## Шаги настройки

### 1. Создание таблиц в Supabase

Выполните SQL скрипт `generations-setup.sql` в Supabase SQL Editor:

1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `generations-setup.sql`
4. Выполните скрипт

Это создаст таблицы:
- `image_generations` - для истории генераций изображений
- `video_generations` - для истории генераций видео

### 2. Создание SQL функций

Выполните SQL скрипт `generations-sql-functions.sql` в Supabase SQL Editor:

1. В том же SQL Editor
2. Скопируйте содержимое файла `generations-sql-functions.sql`
3. Выполните скрипт

Это создаст функции для работы с историей генераций, которые обходят RLS (Row Level Security) при использовании Service Role Key.

### 3. Проверка настроек

Убедитесь, что в вашем `.env` файле настроены следующие переменные:

```env
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:3001
```

## Как это работает

### Изображения
- При успешной генерации изображения автоматически сохраняются в БД
- Сохраняются: промпт, модель, параметры генерации, URL/base64 изображений
- Изображения хранятся как массив URL или base64 data URLs в JSONB поле

### Видео
- При создании запроса на генерацию видео создается запись в БД со статусом "processing"
- При обновлении статуса (завершение/ошибка) запись обновляется
- Сохраняются: промпт, модель, параметры генерации, video_id, video_url, статус

## Storage Bucket

**Вопрос: Нужно ли создавать storage bucket в Supabase?**

**Ответ:** Не обязательно, но зависит от ваших потребностей:

### Текущая реализация (без storage bucket):
- Изображения хранятся как base64 data URLs или внешние URL в JSONB поле БД
- Видео хранятся как внешние URL в текстовом поле БД
- Это работает для небольших изображений и внешних URL

### Если нужен storage bucket:
Создайте storage bucket, если:
1. Вы хотите хранить файлы локально в Supabase
2. Изображения слишком большие для хранения в БД (base64 увеличивает размер на ~33%)
3. Нужен контроль над жизненным циклом файлов
4. Нужны дополнительные функции (CDN, оптимизация и т.д.)

### Как создать storage bucket (если нужно):

1. В Supabase Dashboard перейдите в Storage
2. Создайте новый bucket (например, `generations`)
3. Настройте политики доступа:
   - Пользователи могут загружать свои файлы
   - Пользователи могут читать свои файлы
   - Пользователи могут удалять свои файлы

Пример политики:
```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);
```

4. Обновите код для загрузки файлов в storage вместо хранения base64

## API Endpoints

### Изображения
- `GET /api/generations/image` - Получить все генерации изображений пользователя
- `POST /api/generations/image` - Создать новую генерацию изображения
- `PUT /api/generations/image/:id` - Обновить генерацию изображения

### Видео
- `GET /api/generations/video` - Получить все генерации видео пользователя
- `POST /api/generations/video` - Создать новую генерацию видео
- `PUT /api/generations/video/:id` - Обновить генерацию видео

Все endpoints требуют аутентификации (Bearer token).

## Структура данных

### Image Generation
```typescript
{
  id: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  quality?: string;
  size?: string;
  outputFormat?: string;
  numImages?: number;
  imageUrls: string[]; // Array of URLs or base64 data URLs
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Video Generation
```typescript
{
  id: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  videoId?: string;
  videoUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'moderation_failed';
  errorMessage?: string;
  // AITunnel specific
  duration?: number;
  size?: string;
  seconds?: number;
  cameraMovement?: string;
  seed?: number;
  waterMark?: boolean;
  // AITunnel specific
  size?: string;
  seconds?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Примечания

- История генераций сохраняется только для авторизованных пользователей
- Если пользователь не авторизован, генерации выполняются, но не сохраняются в БД
- Ошибки сохранения логируются в консоль, но не показываются пользователю
- RLS (Row Level Security) настроен так, что пользователи видят только свои генерации

