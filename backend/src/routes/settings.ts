import { Router, Response } from 'express';
import { AdminService } from '../services/adminService';

const router = Router();

/** GET /api/settings/plan-config — публичный конфиг тарифов (без авторизации) */
router.get('/plan-config', async (_req, res: Response) => {
  try {
    const { freeChatModelIds, freeImageLimit, freeVideoLimit, error } = await AdminService.getPlanConfig();
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ freeChatModelIds, freeImageLimit, freeVideoLimit });
  } catch (error) {
    console.error('GET /settings/plan-config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
