# AI Assistant Platform

<div align="center">

![AI Assistant](https://img.shields.io/badge/AI-Assistant-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

**Мощная платформа для работы с AI моделями: чаты, генерация изображений и видео**

[Документация](#-документация) • [Установка](#-быстрый-старт) • [Возможности](#-основные-возможности)

</div>

---

## 📋 Оглавление

- [Описание](#-описание)
- [Основные возможности](#-основные-возможности)
- [Технологии](#-технологии)
- [Быстрый старт](#-быстрый-старт)
- [Структура проекта](#-структура-проекта)
- [Настройка](#-настройка)
- [Документация](#-документация)
- [Скриншоты](#-скриншоты)
- [Разработка](#-разработка)
- [Безопасность](#-безопасность)
- [Лицензия](#-лицензия)

---

## 🎯 Описание

AI Assistant Platform — это полнофункциональная веб-платформа для работы с различными AI моделями. Платформа предоставляет единый интерфейс для общения с AI, генерации изображений и видео, а также включает административную панель для управления системой.

### Ключевые особенности:

- 🤖 **Множество AI моделей** — поддержка различных моделей (GPT, Claude, Gemini и др.)
- 💬 **Умные чаты** — сохранение истории, контекста и выбранной модели
- 🎨 **Генерация изображений** — создание изображений из текстовых описаний
- 🎬 **Генерация видео** — создание видео с помощью PixVerse и AITunnel
- 👥 **Управление пользователями** — административная панель с полным контролем
- 🔒 **Безопасность** — защита данных через Row Level Security (RLS)
- 📱 **Адаптивный дизайн** — работает на всех устройствах
- ✨ **Современный UI** — красивые анимации и интуитивный интерфейс

---

## ✨ Основные возможности

### Для пользователей:

- ✅ **Регистрация и авторизация** через Supabase Auth
- ✅ **Чат с AI моделями** с сохранением истории
- ✅ **Генерация изображений** из текстовых описаний
- ✅ **Генерация видео** из текстовых описаний
- ✅ **История генераций** — просмотр всех созданных изображений и видео
- ✅ **Управление аккаунтом** — настройки профиля
- ✅ **Публичный доступ** — просмотр моделей и главной страницы без регистрации

### Для администраторов:

- ✅ **Управление пользователями** — просмотр, блокировка, разблокировка
- ✅ **Системные настройки** — управление регистрацией и другими параметрами
- ✅ **Управление моделями** — включение/выключение моделей
- ✅ **Логи активности** — отслеживание действий пользователей
- ✅ **Управление администраторами** — добавление/удаление админов (только для супер-админов)

---

## 🛠 Технологии

### Frontend:

- **React 18.3** — UI библиотека
- **TypeScript 5.5** — типизация
- **Vite 5.4** — сборщик и dev-сервер
- **React Router DOM 7.11** — маршрутизация
- **Tailwind CSS 3.4** — стилизация
- **Framer Motion 12.0** — анимации
- **Lucide React** — иконки
- **React Markdown** — рендеринг markdown
- **Supabase JS 2.89** — клиент для Supabase

### Backend:

- **Express.js 4.18** — веб-фреймворк
- **TypeScript 5.5** — типизация
- **Supabase JS 2.89** — работа с БД
- **CORS 2.8** — настройка CORS
- **dotenv 16.4** — переменные окружения

### База данных и инфраструктура:

- **Supabase** — PostgreSQL база данных
- **Supabase Auth** — аутентификация
- **Supabase Storage** — хранение видео
- **Row Level Security (RLS)** — безопасность данных

---

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ и npm
- Аккаунт Supabase ([supabase.com](https://supabase.com))
- API ключи (опционально):
  - Intelligence.io (для AI чатов)
  - AITunnel (для моделей Sora, Wan)

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd "final3 feature back"
```

2. **Установите зависимости фронтенда:**
```bash
npm install
```

3. **Установите зависимости бэкенда:**
```bash
cd backend
npm install
cd ..
```

4. **Настройте Supabase:**
   - Создайте проект на [supabase.com](https://supabase.com)
   - Отключите подтверждение email (Authentication → Providers → Email → Confirm email: OFF)
   - Выполните SQL скрипты в Supabase SQL Editor:
     - `supabase-setup.sql` — основная настройка
     - `generations-setup.sql` — таблицы для генераций
     - `admin-setup.sql` — административная панель
     - `backend-sql-functions.sql` — функции для бэкенда
     - `generations-sql-functions.sql` — функции для генераций

5. **Настройте переменные окружения:**

   **Backend** (создайте `backend/.env`):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend** (создайте `.env` в корне проекта):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_AI_API_KEY=your_intelligence_io_key
   VITE_AITUNNEL_API_KEY=your_aitunnel_key
   VITE_API_BASE_URL=http://localhost:3001
   ```

6. **Запустите приложение:**

   **Терминал 1 — Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Терминал 2 — Frontend:**
   ```bash
   npm run dev
   ```

7. **Откройте браузер:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

---

## 📁 Структура проекта

```
final3-feature-back/
├── backend/                    # Backend сервер
│   ├── src/
│   │   ├── config/            # Конфигурация (Supabase)
│   │   ├── middleware/        # Middleware (auth, admin)
│   │   ├── routes/            # API роуты
│   │   │   ├── chat.ts        # Роуты для чатов
│   │   │   ├── generations.ts # Роуты для генераций
│   │   │   └── admin.ts       # Роуты для админ-панели
│   │   ├── services/          # Бизнес-логика
│   │   │   ├── chatService.ts
│   │   │   ├── generationService.ts
│   │   │   ├── storageService.ts
│   │   │   └── adminService.ts
│   │   ├── types/             # TypeScript типы
│   │   └── index.ts           # Точка входа
│   ├── package.json
│   └── tsconfig.json
│
├── src/                        # Frontend приложение
│   ├── components/            # React компоненты
│   │   ├── Header.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ModelCard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── ...
│   ├── pages/                 # Страницы
│   │   ├── HomePage.tsx       # Главная страница
│   │   ├── ChatPage.tsx       # Страница чата
│   │   ├── ModelsPage.tsx     # Каталог моделей
│   │   ├── VideoPage.tsx      # Генерация видео
│   │   ├── ImagePage.tsx      # Генерация изображений
│   │   ├── ToolsPage.tsx      # Инструменты
│   │   ├── AccountPage.tsx    # Личный кабинет
│   │   ├── AdminPage.tsx      # Админ-панель
│   │   └── NotFoundPage.tsx
│   ├── services/              # API сервисы
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   ├── aiService.ts
│   │   ├── videoService.ts
│   │   ├── imageService.ts
│   │   ├── adminService.ts
│   │   └── generationService.ts
│   ├── contexts/              # React контексты
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── constants/             # Константы
│   │   ├── models.ts          # AI модели
│   │   ├── videoModels.ts     # Модели для видео
│   │   ├── imageModels.ts     # Модели для изображений
│   │   └── tools.ts           # Инструменты
│   ├── hooks/                 # Кастомные хуки
│   │   └── useChat.ts
│   ├── config/                # Конфигурация
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── types/                 # TypeScript типы
│   ├── utils/                 # Утилиты
│   ├── App.tsx                # Главный компонент
│   ├── main.tsx               # Точка входа
│   └── index.css              # Глобальные стили
│
├── supabase-setup.sql         # SQL скрипт настройки БД
├── generations-setup.sql      # SQL скрипт для генераций
├── admin-setup.sql            # SQL скрипт для админ-панели
├── backend-sql-functions.sql  # SQL функции для бэкенда
├── create-super-admin.sql     # SQL скрипт создания супер-админа
├── BACKEND_DOCUMENTATION.md   # Полная документация бэкенда
├── SETUP.md                   # Детальная инструкция по установке
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚙️ Настройка

### Создание супер-администратора

После регистрации пользователя выполните SQL запрос в Supabase SQL Editor:

```sql
-- Замените 'user-uuid' на UUID вашего пользователя
INSERT INTO public.admins (user_id, role, created_by, updated_at)
VALUES ('user-uuid', 'super_admin', 'user-uuid', NOW())
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin', updated_at = NOW();
```

Или используйте готовый скрипт `create-super-admin.sql`, заменив UUID.

### Настройка API ключей

API ключи настраиваются в `.env` файле фронтенда:

- **VITE_AI_API_KEY** — используется для всех AI чатов (Intelligence.io)
- **VITE_PIXVERSE_API_KEY** — для модели PixVerse (генерация видео)
- **VITE_AITUNNEL_API_KEY** — для моделей Sora 2, Sora 2 Pro, Wan 2.5

**Важно:** Эти ключи используются всеми пользователями платформы. Для продакшена рекомендуется настроить rate limiting и мониторинг использования.

### Настройка Supabase Storage

Для хранения видео необходимо создать bucket в Supabase Storage:

1. Перейдите в Supabase Dashboard → Storage
2. Создайте bucket с именем `videos`
3. Установите публичный доступ (если нужно)
4. Или используйте автоматическое создание через StorageService

---

## 📚 Документация

### Основная документация:

- **[SETUP.md](./SETUP.md)** — Детальная инструкция по установке и настройке
- **[BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md)** — Полная документация по бэкенду API
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** — Настройка бэкенда
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** — Настройка административной панели

### SQL скрипты:

- **supabase-setup.sql** — Основная настройка базы данных
- **generations-setup.sql** — Таблицы для генераций изображений и видео
- **admin-setup.sql** — Таблицы и политики для админ-панели
- **backend-sql-functions.sql** — SQL функции для работы бэкенда
- **generations-sql-functions.sql** — SQL функции для генераций

### API документация:

Полная документация API доступна в [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md).

**Основные endpoints:**

- `GET /api/chat/sessions` — Получить все чат-сессии
- `POST /api/chat/sessions` — Создать новую сессию
- `GET /api/generations/image` — Получить генерации изображений
- `POST /api/generations/image` — Создать генерацию изображения
- `GET /api/generations/video` — Получить генерации видео
- `POST /api/generations/video` — Создать генерацию видео
- `GET /api/admin/users` — Получить всех пользователей (требует админ-прав)

---

## 🎨 Скриншоты

### Главная страница
- Современный дизайн с анимациями
- Презентация возможностей платформы
- Статистика и примеры использования

### Чат с AI
- Интерфейс общения с AI моделями
- Сохранение истории сообщений
- Поддержка markdown и кода

### Генерация контента
- Генерация изображений из текста
- Генерация видео из текста
- История всех генераций

### Административная панель
- Управление пользователями
- Системные настройки
- Управление моделями
- Логи активности

---

## 💻 Разработка

### Команды разработки

**Frontend:**
```bash
npm run dev          # Запуск dev-сервера
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр продакшен сборки
npm run lint         # Проверка кода линтером
```

**Backend:**
```bash
cd backend
npm run dev          # Запуск с автоперезагрузкой
npm run build        # Сборка TypeScript
npm start            # Запуск продакшен версии
npm run type-check   # Проверка типов
```

### Структура кода

- **Компоненты** — переиспользуемые UI компоненты
- **Страницы** — основные страницы приложения
- **Сервисы** — логика работы с API
- **Контексты** — глобальное состояние (Auth, Theme)
- **Хуки** — кастомные React хуки
- **Типы** — TypeScript интерфейсы и типы

### Добавление новой модели

1. Откройте `src/constants/models.ts`
2. Добавьте модель в массив `AI_MODELS`:
```typescript
{
  id: 'provider/model-name',
  name: 'Model Name',
  description: 'Описание модели',
  provider: 'Provider',
  category: 'chat' | 'image' | 'video',
  // ... другие параметры
}
```

### Кастомизация стилей

Стили настраиваются через:
- `tailwind.config.js` — конфигурация Tailwind CSS
- `src/index.css` — глобальные стили и CSS переменные

---

## 🔒 Безопасность

### Аутентификация и авторизация

- JWT токены через Supabase Auth
- Защищенные роуты на фронтенде
- Проверка прав на бэкенде

### Защита данных

- **Row Level Security (RLS)** — пользователи видят только свои данные
- **Service Role Key** — используется только на бэкенде
- **CORS** — настроен для работы только с указанным фронтендом

### Административные функции

- Двухуровневая система прав: `admin` и `super_admin`
- Логирование всех административных действий
- Блокировка пользователей с указанием причины

---

## 🐛 Устранение неполадок

### Ошибка подключения к Supabase

1. Проверьте `.env` файлы (фронтенд и бэкенд)
2. Убедитесь, что URL и ключи скопированы полностью
3. Проверьте, что проект Supabase активен

### Ошибка "Email not confirmed"

1. Отключите подтверждение email в Supabase Dashboard
2. Или проверьте почту и подтвердите email

### Чаты не сохраняются

1. Убедитесь, что бэкенд запущен
2. Проверьте `VITE_API_BASE_URL` в `.env`
3. Проверьте выполнение SQL скриптов в Supabase

### CORS ошибки

1. Проверьте `FRONTEND_URL` в `backend/.env`
2. Убедитесь, что URL совпадает с адресом фронтенда

### Ошибки при генерации

1. Проверьте API ключи в `.env`
2. Убедитесь, что ключи валидны и не истекли
3. Проверьте лимиты API провайдеров

---

## 📝 Changelog

### Версия 1.0.0

- ✅ Регистрация и авторизация пользователей
- ✅ Чат с AI моделями
- ✅ Генерация изображений
- ✅ Генерация видео
- ✅ Административная панель
- ✅ Управление пользователями
- ✅ Системные настройки
- ✅ Управление моделями
- ✅ Хранение видео в Supabase Storage
- ✅ Анимации на главной странице
- ✅ Публичный доступ к моделям

---

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста:

1. Создайте fork проекта
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

---

## 👨‍💻 Авторы

- Разработка и дизайн: [Ваше имя/команда]

---

## 🙏 Благодарности

- [Supabase](https://supabase.com) — за отличную платформу для БД и аутентификации
- [Intelligence.io](https://intelligence.io) — за API для AI моделей
- [AITunnel](https://aitunnel.com) — за API для моделей Sora и Wan
- Всем контрибьюторам проекта

---

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [документацию](#-документация)
2. Изучите [раздел устранения неполадок](#-устранение-неполадок)
3. Создайте Issue в репозитории

---

<div align="center">

**Сделано с ❤️ для сообщества разработчиков**

⭐ Если проект вам понравился, поставьте звезду!

</div>
