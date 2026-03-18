# Настройка Supabase Storage для хранения видео

## Обзор

Теперь сгенерированные видео автоматически загружаются в Supabase Storage для постоянного хранения. Это решает проблему, когда API агрегатор не хранит видео постоянно.

## Автоматическое создание bucket

Bucket `videos` создается автоматически при первой загрузке видео. Однако, для лучшего контроля вы можете создать его вручную:

### Создание bucket вручную (рекомендуется)

1. Перейдите в Supabase Dashboard → **Storage**
2. Нажмите **New bucket**
3. Название: `videos`
4. Настройки:
   - **Public bucket**: ✅ Включено (чтобы видео были доступны по публичным URL)
   - **File size limit**: 100 MB (или больше, если нужно)
   - **Allowed MIME types**: `video/mp4`, `video/webm`, `video/quicktime`

### Настройка политик доступа (опционально)

Если вы хотите более строгий контроль доступа, вы можете настроить политики RLS для bucket:

```sql
-- Политика для чтения (публичный доступ)
CREATE POLICY "Public video access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Политика для загрузки (только авторизованные пользователи)
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика для удаления (только владелец)
CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Как это работает

1. **Генерация видео**: Пользователь генерирует видео через API (AITunnel)
2. **Автоматическая загрузка**: После успешной генерации видео автоматически загружается в Supabase Storage
3. **Хранение URL**: Supabase URL сохраняется в поле `video_url` таблицы `video_generations`
4. **Доступ к видео**: Видео доступны по постоянным публичным URL из Supabase

## Структура хранения

Видео хранятся в следующей структуре:
```
videos/
  └── {user_id}/
      └── {generation_id}.mp4
```

Это обеспечивает:
- Изоляцию видео по пользователям
- Уникальные имена файлов
- Легкое удаление при удалении пользователя

## Обработка ошибок

Если загрузка в Supabase не удалась:
- Видео все равно отображается с оригинального URL (если доступен)
- Ошибка логируется в консоль
- Пользователь может попробовать загрузить видео вручную позже

## Миграция существующих видео

Для существующих видео с внешними URL вы можете создать скрипт миграции, который:
1. Получает все видео с внешними URL
2. Загружает их в Supabase Storage
3. Обновляет `video_url` на Supabase URL

Пример скрипта миграции (выполняется на бэкенде):

```typescript
// Пример миграции (не включен в проект, только для справки)
async function migrateExistingVideos() {
  const { generations } = await GenerationService.getUserVideoGenerations(userId);
  
  for (const gen of generations) {
    if (gen.videoUrl && !gen.videoUrl.includes('supabase.co')) {
      // Загрузить в Supabase
      const result = await StorageService.downloadAndUploadVideo(
        gen.videoUrl,
        gen.userId,
        gen.id
      );
      
      if (result.url) {
        await GenerationService.updateVideoGeneration(gen.id, {
          videoUrl: result.url,
        });
      }
    }
  }
}
```

## Ограничения

- **Размер файла**: По умолчанию 100 MB на файл (можно изменить в настройках bucket)
- **Хранилище**: Зависит от вашего плана Supabase
- **Стоимость**: Supabase Storage имеет бесплатный лимит, после которого взимается плата

## Проверка работы

После настройки проверьте:
1. Сгенерируйте новое видео
2. Проверьте, что видео загрузилось в Supabase Storage
3. Убедитесь, что `video_url` в БД содержит Supabase URL
4. Проверьте, что видео воспроизводится по Supabase URL
