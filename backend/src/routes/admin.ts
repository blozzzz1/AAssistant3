import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import { AdminService } from '../services/adminService';
import { validateRequest } from '../middleware/validate';

const router = Router();
const pagingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const adminUserIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

const blockUserBodySchema = z.object({
  reason: z.string().trim().min(1).max(1000),
  blockedUntil: z.string().datetime().optional(),
});

const updateSystemSettingBodySchema = z.object({
  value: z.unknown(),
});

const updatePlanConfigBodySchema = z.object({
  freeChatModelIds: z.array(z.string().trim().min(1).max(150)).optional(),
  freeImageLimit: z.number().int().min(0).optional(),
  freeVideoLimit: z.number().int().min(0).optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field must be provided',
});

const updateModelSettingBodySchema = z.object({
  isEnabled: z.boolean(),
  reason: z.string().max(1000).optional(),
});

const activityQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const addAdminBodySchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'super_admin']),
});

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users - Get all users
router.get('/users', validateRequest({ query: pagingQuerySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { users, total, error } = await AdminService.getAllUsers(limit, offset);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ users, total });
  } catch (error) {
    console.error('Error in GET /admin/users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', validateRequest({ params: userIdParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user, error } = await AdminService.getUserById(id);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error in GET /admin/users/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users/:id/block - Block user
router.post('/users/:id/block', validateRequest({ params: userIdParamsSchema, body: blockUserBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { reason, blockedUntil } = req.body;

    const { error } = await AdminService.blockUser(
      id,
      req.userId,
      reason,
      blockedUntil ? new Date(blockedUntil) : undefined
    );

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_user_blocked',
      { blockedUserId: id, reason, blockedUntil: blockedUntil || 'permanent' },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /admin/users/:id/block:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users/:id/unblock - Unblock user
router.post('/users/:id/unblock', validateRequest({ params: userIdParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await AdminService.unblockUser(id);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_user_unblocked',
      { unblockedUserId: id },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /admin/users/:id/unblock:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/settings - Get system settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings, error } = await AdminService.getSystemSettings();

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error in GET /admin/settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/settings/:key - Update system setting
router.put('/settings/:key', validateRequest({ body: updateSystemSettingBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { key } = req.params;
    const { value } = req.body;

    const { error } = await AdminService.updateSystemSetting(key, value, req.userId);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_setting_updated',
      { settingKey: key, newValue: value },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /admin/settings/:key:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/plan-config - Get plan config (free model ids, limits)
router.get('/plan-config', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { freeChatModelIds, freeImageLimit, freeVideoLimit, error } = await AdminService.getPlanConfig();
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ freeChatModelIds, freeImageLimit, freeVideoLimit });
  } catch (error) {
    console.error('Error in GET /admin/plan-config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/plan-config - Update plan config
router.put('/plan-config', validateRequest({ body: updatePlanConfigBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { freeChatModelIds, freeImageLimit, freeVideoLimit } = req.body;
    const update: { freeChatModelIds?: string[]; freeImageLimit?: number; freeVideoLimit?: number } = {};
    if (Array.isArray(freeChatModelIds)) update.freeChatModelIds = freeChatModelIds;
    if (typeof freeImageLimit === 'number' && freeImageLimit >= 0) update.freeImageLimit = freeImageLimit;
    if (typeof freeVideoLimit === 'number' && freeVideoLimit >= 0) update.freeVideoLimit = freeVideoLimit;
    const { error } = await AdminService.updatePlanConfig(req.userId, update);
    if (error) {
      res.status(500).json({ error });
      return;
    }
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(req.userId!, 'admin_plan_config_updated', update, ipAddress, userAgent);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /admin/plan-config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/models - Get model settings
router.get('/models', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { settings, error } = await AdminService.getModelSettings();

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ settings });
  } catch (error) {
    console.error('Error in GET /admin/models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/models/* - Update model setting (modelId может содержать слэш, например moonshotai/Kimi-K2-Instruct-0905)
router.put(/^\/models\/(.+)$/, validateRequest({ body: updateModelSettingBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const modelId = req.path.replace(/^\/models\//, '') || '';
    if (!modelId) {
      res.status(400).json({ error: 'modelId is required' });
      return;
    }
    const { isEnabled, reason } = req.body;

    const { error } = await AdminService.updateModelSetting(
      modelId,
      isEnabled,
      req.userId,
      reason
    );

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_model_setting_updated',
      { modelId, isEnabled, reason: reason || null },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /admin/models/:modelId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/activity - Get activity logs
router.get('/activity', validateRequest({ query: activityQuerySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const { logs, total, error } = await AdminService.getUserActivityLogs(userId, limit, offset);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ logs, total });
  } catch (error) {
    console.error('Error in GET /admin/activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Super admin only routes
// GET /api/admin/admins - Get all admins
router.get('/admins', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { admins, error } = await AdminService.getAdmins();

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ admins });
  } catch (error) {
    console.error('Error in GET /admin/admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/admins - Add admin
router.post('/admins', requireSuperAdmin, validateRequest({ body: addAdminBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId, role } = req.body;

    const { error } = await AdminService.addAdmin(userId, role, req.userId);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_admin_added',
      { addedUserId: userId, role },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /admin/admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/admins/:userId - Remove admin
router.delete('/admins/:userId', requireSuperAdmin, validateRequest({ params: adminUserIdParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { error } = await AdminService.removeAdmin(userId);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Log activity
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await AdminService.logActivity(
      req.userId!,
      'admin_admin_removed',
      { removedUserId: userId },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /admin/admins/:userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
