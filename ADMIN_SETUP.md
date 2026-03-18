# Настройка админ-панели

## Установка

1. **Выполните SQL скрипт** для создания таблиц админ-панели:
   ```sql
   -- Выполните admin-setup.sql в Supabase SQL Editor
   ```

2. **Создайте первого администратора**:
   ```sql
   -- Замените YOUR_USER_ID на ID пользователя из auth.users
   INSERT INTO public.admins (user_id, role, created_by)
   VALUES ('YOUR_USER_ID', 'super_admin', 'YOUR_USER_ID');
   ```

## Доступ к админ-панели

После создания администратора, перейдите по адресу: `/admin`

## Функции админ-панели

### 1. Управление пользователями
- Просмотр всех пользователей
- Блокировка/разблокировка пользователей
- Просмотр информации о пользователях

### 2. Системные настройки
- Включение/отключение регистрации
- Режим обслуживания

### 3. Управление моделями
- Включение/отключение моделей AI
- Указание причины отключения

### 4. Журнал активности
- Просмотр действий пользователей
- Фильтрация по пользователю

### 5. Управление администраторами (только для super_admin)
- Добавление новых администраторов
- Удаление администраторов
- Назначение ролей (admin/super_admin)

## Роли

- **admin**: Обычный администратор, может управлять пользователями, настройками и моделями
- **super_admin**: Супер-администратор, имеет все права admin + может управлять другими администраторами

## API Эндпоинты

Все эндпоинты требуют аутентификации и прав администратора:

- `GET /api/admin/users` - Получить список пользователей
- `GET /api/admin/users/:id` - Получить информацию о пользователе
- `POST /api/admin/users/:id/block` - Заблокировать пользователя
- `POST /api/admin/users/:id/unblock` - Разблокировать пользователя
- `GET /api/admin/settings` - Получить системные настройки
- `PUT /api/admin/settings/:key` - Обновить настройку
- `GET /api/admin/models` - Получить настройки моделей
- `PUT /api/admin/models/:modelId` - Обновить настройку модели
- `GET /api/admin/activity` - Получить журнал активности
- `GET /api/admin/admins` - Получить список администраторов (super_admin)
- `POST /api/admin/admins` - Добавить администратора (super_admin)
- `DELETE /api/admin/admins/:userId` - Удалить администратора (super_admin)

## Безопасность

- Все эндпоинты защищены middleware `requireAdmin` или `requireSuperAdmin`
- Row Level Security (RLS) настроен для всех таблиц
- Только администраторы могут видеть и изменять данные админ-панели

## Проверка блокировки пользователей

Для проверки блокировки пользователей при входе, добавьте проверку в ваш код аутентификации:

```typescript
// В бэкенде при входе пользователя
const { data: block } = await supabaseAdmin
  .from('user_blocks')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)
  .single();

if (block && (!block.blocked_until || new Date(block.blocked_until) > new Date())) {
  // Пользователь заблокирован
  throw new Error('Ваш аккаунт заблокирован');
}
```

## Проверка доступности регистрации

Для проверки доступности регистрации:

```typescript
const { data: setting } = await supabaseAdmin
  .from('system_settings')
  .select('value')
  .eq('key', 'registration_enabled')
  .single();

if (!setting || !setting.value) {
  // Регистрация отключена
  throw new Error('Регистрация временно недоступна');
}
```

## Проверка доступности моделей

Для проверки доступности модели:

```typescript
const { data: modelSetting } = await supabaseAdmin
  .from('model_settings')
  .select('is_enabled')
  .eq('model_id', modelId)
  .single();

if (modelSetting && !modelSetting.is_enabled) {
  // Модель отключена
  throw new Error('Эта модель временно недоступна');
}
```
