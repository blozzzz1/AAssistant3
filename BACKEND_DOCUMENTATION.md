# Полная документация по бэкенду

## Оглавление
1. [Обзор](#обзор)
2. [Структура проекта](#структура-проекта)
3. [Установка и настройка](#установка-и-настройка)
4. [Конфигурация](#конфигурация)
5. [Middleware](#middleware)
6. [API Endpoints](#api-endpoints)
7. [Сервисы](#сервисы)
8. [Типы данных](#типы-данных)
9. [Безопасность](#безопасность)
10. [Обработка ошибок](#обработка-ошибок)

---

## Обзор

Backend API для AI Assistant платформы, построенный на Express.js и TypeScript. Использует Supabase для базы данных и аутентификации. Предоставляет RESTful API для управления чатами, генерацией изображений и видео, а также административными функциями.

### Основные возможности:
- Управление чат-сессиями
- Генерация изображений и видео
- Хранение видео в Supabase Storage
- Административная панель
- Управление пользователями и настройками системы
- Логирование активности пользователей

---

## Структура проекта

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts          # Конфигурация Supabase клиента
│   ├── middleware/
│   │   ├── auth.ts              # Аутентификация пользователей
│   │   └── adminAuth.ts          # Проверка прав администратора
│   ├── routes/
│   │   ├── chat.ts              # Роуты для чатов
│   │   ├── generations.ts       # Роуты для генераций
│   │   └── admin.ts              # Роуты для админ-панели
│   ├── services/
│   │   ├── chatService.ts       # Бизнес-логика чатов
│   │   ├── generationService.ts # Бизнес-логика генераций
│   │   ├── storageService.ts    # Работа с Supabase Storage
│   │   └── adminService.ts      # Бизнес-логика админ-панели
│   ├── types/
│   │   └── index.ts             # TypeScript типы
│   └── index.ts                  # Точка входа приложения
├── package.json
├── tsconfig.json
└── .env                          # Переменные окружения
```

---

## Установка и настройка

### Требования
- Node.js 18+ 
- npm или yarn
- Supabase проект

### Установка зависимостей
```bash
cd backend
npm install
```

### Настройка переменных окружения

Создайте файл `.env` в папке `backend/`:

```env
# Supabase конфигурация
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Сервер
PORT=3001
NODE_ENV=development

# Frontend URL (для CORS)
FRONTEND_URL=http://localhost:5173
```

**Важно:** Service Role Key можно найти в Supabase Dashboard → Settings → API → service_role key. Этот ключ имеет полный доступ к БД и НЕ должен быть доступен на фронтенде!

### Запуск

**Режим разработки (с автоперезагрузкой):**
```bash
npm run dev
```

**Продакшен:**
```bash
npm run build
npm start
```

**Проверка типов:**
```bash
npm run type-check
```

---

## Конфигурация

### Supabase Client (`src/config/supabase.ts`)

Использует Service Role Key для обхода RLS (Row Level Security) политик на уровне бэкенда.

```typescript
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    }
  }
);
```

### Express Server (`src/index.ts`)

- **CORS:** Настроен для работы только с указанным фронтендом
- **Payload Limit:** 10MB (для больших файлов)
- **Health Check:** `GET /health` - проверка работоспособности сервера

---

## Middleware

### 1. Аутентификация (`src/middleware/auth.ts`)

**Функция:** `authenticateToken`

Проверяет JWT токен из заголовка `Authorization: Bearer <token>` и добавляет информацию о пользователе в `req.userId` и `req.user`.

**Использование:**
```typescript
router.use(authenticateToken);
```

**Интерфейс:**
```typescript
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}
```

**Ошибки:**
- `401` - Токен не предоставлен
- `401` - Невалидный или истекший токен

### 2. Проверка прав администратора (`src/middleware/adminAuth.ts`)

**Функции:**
- `requireAdmin` - Проверяет, что пользователь является администратором (`admin` или `super_admin`)
- `requireSuperAdmin` - Проверяет, что пользователь является супер-администратором

**Использование:**
```typescript
router.use(requireAdmin); // Для всех админ-роутов
router.get('/admins', requireSuperAdmin, handler); // Только для супер-админа
```

**Ошибки:**
- `401` - Пользователь не авторизован
- `403` - Недостаточно прав

---

## API Endpoints

### Базовый URL
```
http://localhost:3001/api
```

### Аутентификация

Все endpoints (кроме `/health`) требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

---

### Chat API (`/api/chat`)

#### GET `/api/chat/sessions`
Получить все сессии текущего пользователя.

**Ответ:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Название чата",
      "selectedModel": "openai/gpt-oss-120b",
      "messages": [],
      "createdAt": "2025-01-13T...",
      "updatedAt": "2025-01-13T...",
      "userId": "user-uuid"
    }
  ]
}
```

#### GET `/api/chat/sessions/:id`
Получить конкретную сессию по ID.

**Параметры:**
- `id` (path) - UUID сессии

**Ответ:**
```json
{
  "session": {
    "id": "uuid",
    "title": "Название чата",
    "selectedModel": "openai/gpt-oss-120b",
    "messages": [...],
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T...",
    "userId": "user-uuid"
  }
}
```

**Ошибки:**
- `404` - Сессия не найдена или не принадлежит пользователю

#### POST `/api/chat/sessions`
Создать новую сессию.

**Тело запроса:**
```json
{
  "title": "Название чата",
  "selectedModel": "openai/gpt-oss-120b"
}
```

**Обязательные поля:**
- `title` - Название сессии
- `selectedModel` - ID модели

**Ответ:**
```json
{
  "session": {
    "id": "uuid",
    "title": "Название чата",
    "selectedModel": "openai/gpt-oss-120b",
    "messages": [],
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T...",
    "userId": "user-uuid"
  }
}
```

**Ошибки:**
- `400` - Отсутствуют обязательные поля

#### PUT `/api/chat/sessions/:id`
Обновить сессию.

**Параметры:**
- `id` (path) - UUID сессии

**Тело запроса:**
```json
{
  "title": "Обновленное название",
  "selectedModel": "openai/gpt-oss-120b",
  "messages": [...]
}
```

**Ответ:**
```json
{
  "session": {
    "id": "uuid",
    "title": "Обновленное название",
    "selectedModel": "openai/gpt-oss-120b",
    "messages": [...],
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T...",
    "userId": "user-uuid"
  }
}
```

**Ошибки:**
- `404` - Сессия не найдена или не принадлежит пользователю

#### DELETE `/api/chat/sessions/:id`
Удалить сессию.

**Параметры:**
- `id` (path) - UUID сессии

**Ответ:**
```json
{
  "success": true
}
```

**Ошибки:**
- `404` - Сессия не найдена или не принадлежит пользователю

---

### Generations API (`/api/generations`)

#### Image Generation

##### GET `/api/generations/image`
Получить все генерации изображений текущего пользователя.

**Ответ:**
```json
{
  "generations": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "model": "model-id",
      "prompt": "описание изображения",
      "negativePrompt": "нежелательные элементы",
      "quality": "high",
      "size": "1024x1024",
      "outputFormat": "png",
      "numImages": 1,
      "imageUrls": ["https://..."],
      "status": "completed",
      "errorMessage": null,
      "createdAt": "2025-01-13T...",
      "updatedAt": "2025-01-13T..."
    }
  ]
}
```

##### POST `/api/generations/image`
Создать новую генерацию изображения.

**Тело запроса:**
```json
{
  "model": "model-id",
  "prompt": "описание изображения",
  "negativePrompt": "нежелательные элементы",
  "quality": "high",
  "size": "1024x1024",
  "outputFormat": "png",
  "numImages": 1,
  "imageUrls": [],
  "status": "pending"
}
```

**Обязательные поля:**
- `model` - ID модели
- `prompt` - Описание изображения

**Ответ:**
```json
{
  "generation": {
    "id": "uuid",
    "userId": "user-uuid",
    "model": "model-id",
    "prompt": "описание изображения",
    "imageUrls": [],
    "status": "pending",
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T..."
  }
}
```

##### PUT `/api/generations/image/:id`
Обновить генерацию изображения.

**Параметры:**
- `id` (path) - UUID генерации

**Тело запроса:**
```json
{
  "imageUrls": ["https://..."],
  "status": "completed",
  "errorMessage": null
}
```

**Ответ:**
```json
{
  "success": true
}
```

#### Video Generation

##### GET `/api/generations/video`
Получить все генерации видео текущего пользователя.

**Ответ:**
```json
{
  "generations": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "model": "model-id",
      "prompt": "описание видео",
      "videoId": "external-video-id",
      "videoUrl": "https://...",
      "status": "completed",
      "aspectRatio": "16:9",
      "duration": 5,
      "quality": "high",
      "createdAt": "2025-01-13T...",
      "updatedAt": "2025-01-13T..."
    }
  ]
}
```

##### POST `/api/generations/video`
Создать новую генерацию видео.

**Тело запроса:**
```json
{
  "model": "model-id",
  "prompt": "описание видео",
  "negativePrompt": "нежелательные элементы",
  "videoId": null,
  "videoUrl": null,
  "status": "pending",
  "aspectRatio": "16:9",
  "duration": 5,
  "quality": "high",
  "motionMode": "normal",
  "style": "cinematic",
  "cameraMovement": "none",
  "seed": null,
  "waterMark": false,
  "size": "1024x576",
  "seconds": 5
}
```

**Обязательные поля:**
- `model` - ID модели
- `prompt` - Описание видео

**Ответ:**
```json
{
  "generation": {
    "id": "uuid",
    "userId": "user-uuid",
    "model": "model-id",
    "prompt": "описание видео",
    "status": "pending",
    "createdAt": "2025-01-13T...",
    "updatedAt": "2025-01-13T..."
  }
}
```

##### PUT `/api/generations/video/:id`
Обновить генерацию видео.

**Параметры:**
- `id` (path) - UUID генерации

**Тело запроса:**
```json
{
  "videoId": "external-video-id",
  "videoUrl": "https://external-url...",
  "status": "completed",
  "errorMessage": null
}
```

**Ответ:**
```json
{
  "success": true
}
```

##### POST `/api/generations/video/:id/upload`
Загрузить видео в Supabase Storage.

**Параметры:**
- `id` (path) - UUID генерации

**Тело запроса:**
```json
{
  "videoUrl": "https://external-url...",
  "videoId": "external-video-id",
  "apiKey": "api-key-for-aitunnel",
  "isAITunnel": false
}
```

**Варианты:**
1. Загрузка по URL: передать `videoUrl`
2. Загрузка из AITunnel: передать `videoId`, `apiKey`, `isAITunnel: true`

**Ответ:**
```json
{
  "success": true,
  "videoUrl": "https://supabase-storage-url..."
}
```

**Процесс:**
1. Скачивает видео с внешнего URL или из AITunnel API
2. Загружает в Supabase Storage (bucket `videos`)
3. Обновляет запись генерации с новым URL

---

### Admin API (`/api/admin`)

**Требования:** Все endpoints требуют прав администратора (`admin` или `super_admin`).

#### Users Management

##### GET `/api/admin/users`
Получить список всех пользователей.

**Query параметры:**
- `limit` (optional) - Количество записей (по умолчанию 50)
- `offset` (optional) - Смещение для пагинации (по умолчанию 0)

**Ответ:**
```json
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "createdAt": "2025-01-13T...",
      "lastSignInAt": "2025-01-13T...",
      "isBlocked": false,
      "blockReason": null,
      "blockUntil": null,
      "isAdmin": false,
      "adminRole": null
    }
  ],
  "total": 100
}
```

##### GET `/api/admin/users/:id`
Получить информацию о пользователе по ID.

**Параметры:**
- `id` (path) - UUID пользователя

**Ответ:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2025-01-13T...",
    "lastSignInAt": "2025-01-13T...",
    "isBlocked": false,
    "isAdmin": false
  }
}
```

**Ошибки:**
- `404` - Пользователь не найден

##### POST `/api/admin/users/:id/block`
Заблокировать пользователя.

**Параметры:**
- `id` (path) - UUID пользователя

**Тело запроса:**
```json
{
  "reason": "Нарушение правил",
  "blockedUntil": "2025-02-13T..." // опционально, для временной блокировки
}
```

**Ответ:**
```json
{
  "success": true
}
```

##### POST `/api/admin/users/:id/unblock`
Разблокировать пользователя.

**Параметры:**
- `id` (path) - UUID пользователя

**Ответ:**
```json
{
  "success": true
}
```

#### System Settings

##### GET `/api/admin/settings`
Получить все системные настройки.

**Ответ:**
```json
{
  "settings": [
    {
      "id": "uuid",
      "key": "registration_enabled",
      "value": true,
      "description": "Разрешить регистрацию новых пользователей",
      "updatedAt": "2025-01-13T...",
      "updatedBy": "admin-uuid"
    }
  ]
}
```

##### PUT `/api/admin/settings/:key`
Обновить системную настройку.

**Параметры:**
- `key` (path) - Ключ настройки

**Тело запроса:**
```json
{
  "value": false
}
```

**Ответ:**
```json
{
  "success": true
}
```

#### Model Settings

##### GET `/api/admin/models`
Получить настройки всех моделей.

**Ответ:**
```json
{
  "settings": [
    {
      "id": "uuid",
      "modelId": "openai/gpt-oss-120b",
      "isEnabled": true,
      "reason": null,
      "disabledBy": null,
      "disabledAt": null,
      "enabledBy": null,
      "enabledAt": null,
      "updatedAt": "2025-01-13T..."
    }
  ]
}
```

##### PUT `/api/admin/models/:modelId`
Обновить настройку модели (включить/выключить).

**Параметры:**
- `modelId` (path) - ID модели

**Тело запроса:**
```json
{
  "isEnabled": false,
  "reason": "Техническое обслуживание"
}
```

**Ответ:**
```json
{
  "success": true
}
```

#### Activity Logs

##### GET `/api/admin/activity`
Получить логи активности пользователей.

**Query параметры:**
- `userId` (optional) - Фильтр по пользователю
- `limit` (optional) - Количество записей (по умолчанию 100)
- `offset` (optional) - Смещение для пагинации (по умолчанию 0)

**Ответ:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "actionType": "chat_session_created",
      "actionDetails": {
        "sessionId": "session-uuid",
        "model": "openai/gpt-oss-120b"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-01-13T..."
    }
  ],
  "total": 500
}
```

#### Admin Management (Super Admin Only)

##### GET `/api/admin/admins`
Получить список всех администраторов.

**Требования:** Только `super_admin`

**Ответ:**
```json
{
  "admins": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "role": "admin",
      "createdAt": "2025-01-13T...",
      "createdBy": "super-admin-uuid",
      "updatedAt": "2025-01-13T..."
    }
  ]
}
```

##### POST `/api/admin/admins`
Добавить администратора.

**Требования:** Только `super_admin`

**Тело запроса:**
```json
{
  "userId": "user-uuid",
  "role": "admin" // или "super_admin"
}
```

**Ответ:**
```json
{
  "success": true
}
```

**Ошибки:**
- `400` - Невалидная роль (должна быть `admin` или `super_admin`)

##### DELETE `/api/admin/admins/:userId`
Удалить администратора.

**Требования:** Только `super_admin`

**Параметры:**
- `userId` (path) - UUID пользователя

**Ответ:**
```json
{
  "success": true
}
```

---

## Сервисы

### ChatService (`src/services/chatService.ts`)

Управление чат-сессиями.

**Методы:**
- `createSession(userId, title, selectedModel)` - Создать сессию
- `getUserSessions(userId)` - Получить все сессии пользователя
- `getSession(id, userId)` - Получить сессию по ID
- `updateSession(session)` - Обновить сессию
- `deleteSession(id, userId)` - Удалить сессию

**Особенности:**
- Использует RPC функции для обхода RLS
- Fallback на прямые SQL запросы, если RPC не доступны
- Автоматическое преобразование JSON полей

### GenerationService (`src/services/generationService.ts`)

Управление генерациями изображений и видео.

**Методы для изображений:**
- `createImageGeneration(userId, params)` - Создать генерацию
- `getUserImageGenerations(userId)` - Получить все генерации пользователя
- `updateImageGeneration(id, userId, updates)` - Обновить генерацию

**Методы для видео:**
- `createVideoGeneration(userId, params)` - Создать генерацию
- `getUserVideoGenerations(userId)` - Получить все генерации пользователя
- `updateVideoGeneration(id, userId, updates)` - Обновить генерацию

**Особенности:**
- Поддержка различных параметров для моделей AITunnel
- Статусы: `pending`, `processing`, `completed`, `failed`, `moderation_failed`

### StorageService (`src/services/storageService.ts`)

Работа с Supabase Storage для видео.

**Методы:**
- `uploadVideo(videoBlob, userId, videoId)` - Загрузить видео
- `downloadAndUploadVideo(videoUrl, userId, videoId)` - Скачать и загрузить видео
- `downloadAITunnelVideoAndUpload(videoId, apiKey, userId, generationId)` - Скачать из AITunnel и загрузить

**Особенности:**
- Автоматическое создание bucket `videos`, если не существует
- Поддержка Blob, Buffer, ArrayBuffer
- Публичный доступ к видео
- Лимит размера файла: 100MB
- Поддерживаемые форматы: mp4, webm, quicktime

**Структура хранения:**
```
videos/
  {userId}/
    {videoId}.mp4
```

### AdminService (`src/services/adminService.ts`)

Административные функции.

**Методы:**
- `isAdmin(userId)` - Проверить, является ли пользователь админом
- `isSuperAdmin(userId)` - Проверить, является ли пользователь супер-админом
- `getAllUsers(limit, offset)` - Получить всех пользователей
- `getUserById(id)` - Получить пользователя по ID
- `blockUser(userId, blockedBy, reason, blockedUntil)` - Заблокировать пользователя
- `unblockUser(userId)` - Разблокировать пользователя
- `getSystemSettings()` - Получить системные настройки
- `updateSystemSetting(key, value, updatedBy)` - Обновить настройку
- `getModelSettings()` - Получить настройки моделей
- `updateModelSetting(modelId, isEnabled, updatedBy, reason)` - Обновить настройку модели
- `getUserActivityLogs(userId, limit, offset)` - Получить логи активности
- `getAdmins()` - Получить всех администраторов
- `addAdmin(userId, role, createdBy)` - Добавить администратора
- `removeAdmin(userId)` - Удалить администратора

---

## Типы данных

### ChatSession
```typescript
interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  selectedModel: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### Message
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### ImageGeneration
```typescript
interface ImageGeneration {
  id: string;
  userId: string;
  model: string;
  prompt: string;
  negativePrompt?: string;
  quality?: string;
  size?: string;
  outputFormat?: string;
  numImages?: number;
  imageUrls: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### VideoGeneration
```typescript
interface VideoGeneration {
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

### UserInfo
```typescript
interface UserInfo {
  id: string;
  email: string;
  createdAt: Date;
  lastSignInAt?: Date;
  isBlocked: boolean;
  blockReason?: string;
  blockUntil?: Date;
  isAdmin: boolean;
  adminRole?: 'admin' | 'super_admin';
}
```

---

## Безопасность

### Аутентификация
- Все endpoints (кроме `/health`) требуют JWT токен
- Токен проверяется через Supabase Auth API
- Токен передается в заголовке `Authorization: Bearer <token>`

### Авторизация
- Проверка принадлежности данных пользователю на уровне API
- Административные функции требуют соответствующих прав
- Супер-администратор имеет полный доступ

### Service Role Key
- Используется только на бэкенде
- НЕ должен быть доступен на фронтенде
- Обходит RLS политики для операций от имени сервера

### CORS
- Настроен для работы только с указанным фронтендом
- Credentials включены для передачи cookies/tokens

### Row Level Security (RLS)
- Используются RPC функции с `SECURITY DEFINER` для обхода RLS
- Fallback на прямые SQL запросы через Service Role Key

---

## Обработка ошибок

### Стандартные HTTP коды

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос (отсутствуют обязательные поля)
- `401` - Не авторизован (нет токена или токен невалидный)
- `403` - Доступ запрещен (недостаточно прав)
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Формат ошибок

```json
{
  "error": "Описание ошибки"
}
```

### Логирование

Все ошибки логируются в консоль с помощью `console.error()`:
```typescript
console.error('Error in GET /sessions:', error);
```

---

## Примеры использования

### Создание чат-сессии

```bash
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Мой первый чат",
    "selectedModel": "openai/gpt-oss-120b"
  }'
```

### Создание генерации изображения

```bash
curl -X POST http://localhost:3001/api/generations/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "model-id",
    "prompt": "красивый закат над океаном",
    "quality": "high",
    "size": "1024x1024"
  }'
```

### Загрузка видео в Supabase Storage

```bash
curl -X POST http://localhost:3001/api/generations/video/VIDEO_ID/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://external-video-url.com/video.mp4"
  }'
```

### Получение списка пользователей (Admin)

```bash
curl -X GET "http://localhost:3001/api/admin/users?limit=10&offset=0" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Блокировка пользователя (Admin)

```bash
curl -X POST http://localhost:3001/api/admin/users/USER_ID/block \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Нарушение правил использования",
    "blockedUntil": "2025-02-13T00:00:00Z"
  }'
```

---

## Устранение неполадок

### Ошибка "Missing Supabase environment variables"
**Причина:** Отсутствуют переменные окружения в `.env` файле.

**Решение:** Убедитесь, что файл `.env` существует и содержит:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Ошибка "Invalid or expired token"
**Причина:** JWT токен невалидный или истек.

**Решение:** 
- Проверьте, что токен передается в заголовке `Authorization: Bearer <token>`
- Убедитесь, что токен не истек
- Переавторизуйтесь на фронтенде для получения нового токена

### CORS ошибки
**Причина:** Фронтенд URL не совпадает с настройками CORS.

**Решение:** Проверьте, что `FRONTEND_URL` в `.env` соответствует URL вашего фронтенд приложения.

### Ошибка "Forbidden: Admin access required"
**Причина:** Пользователь не является администратором.

**Решение:** Убедитесь, что пользователь добавлен в таблицу `admins` с ролью `admin` или `super_admin`.

### Ошибка при загрузке видео
**Причина:** Проблемы с Supabase Storage или внешним URL.

**Решение:**
- Проверьте, что bucket `videos` существует в Supabase Storage
- Убедитесь, что внешний URL доступен и содержит валидное видео
- Проверьте размер файла (лимит 100MB)

---

## Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Версия документации:** 1.0.0  
**Дата последнего обновления:** 13 января 2025
