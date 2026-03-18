# Настройка бэкенда

## Обзор

Все операции с базой данных теперь выполняются через отдельный бэкенд сервер для обеспечения безопасности. Бэкенд использует Service Role Key, который не должен быть доступен на фронтенде.

## Установка бэкенда

1. Перейдите в папку `backend`:
```bash
cd backend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

4. Заполните переменные окружения в `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Важно:** Service Role Key можно найти в настройках проекта Supabase (Settings → API → service_role key). Этот ключ имеет полный доступ к БД и должен храниться только на бэкенде!

## Запуск бэкенда

### Режим разработки (с автоперезагрузкой):
```bash
npm run dev
```

### Продакшен:
```bash
npm run build
npm start
```

## Настройка фронтенда

Добавьте в `.env` файл фронтенда (в корне проекта):
```env
VITE_API_BASE_URL=http://localhost:3001
```

Если бэкенд запущен на другом порту или домене, укажите соответствующий URL.

## API Endpoints

Все endpoints требуют аутентификации через Bearer токен в заголовке `Authorization`.

### Chat Sessions

- `GET /api/chat/sessions` - Получить все сессии текущего пользователя
- `GET /api/chat/sessions/:id` - Получить конкретную сессию
- `POST /api/chat/sessions` - Создать новую сессию
  ```json
  {
    "title": "Название чата",
    "selectedModel": "openai/gpt-oss-120b"
  }
  ```
- `PUT /api/chat/sessions/:id` - Обновить сессию
  ```json
  {
    "title": "Обновленное название",
    "selectedModel": "openai/gpt-oss-120b",
    "messages": [...]
  }
  ```
- `DELETE /api/chat/sessions/:id` - Удалить сессию

## Безопасность

- ✅ Service Role Key хранится только на бэкенде
- ✅ Все запросы проверяются через JWT токены
- ✅ Проверка принадлежности данных пользователю на уровне API
- ✅ CORS настроен для работы только с указанным фронтендом

## Устранение неполадок

### Ошибка "Missing Supabase environment variables"
Убедитесь, что файл `.env` существует и содержит все необходимые переменные.

### Ошибка "Invalid or expired token"
Проверьте, что пользователь авторизован на фронтенде и токен передается в заголовке `Authorization`.

### CORS ошибки
Убедитесь, что `FRONTEND_URL` в `.env` бэкенда соответствует URL вашего фронтенд приложения.


