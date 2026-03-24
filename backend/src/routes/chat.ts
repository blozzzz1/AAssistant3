import { Router, Response } from 'express';
import { z } from 'zod';
import { ChatService } from '../services/chatService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { AdminService } from '../services/adminService';
import { ChatSession } from '../types';
import { validateRequest } from '../middleware/validate';

const router = Router();
const sessionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

const createSessionBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  selectedModel: z.string().trim().min(1).max(150),
});

const updateSessionBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  selectedModel: z.string().trim().min(1).max(150).optional(),
  messages: z.array(z.unknown()).max(500).optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'At least one field must be provided',
});

// All routes require authentication
router.use(authenticateToken);

// GET /api/chat/sessions - Get all user sessions
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { sessions, error } = await ChatService.getUserSessions(req.userId);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    res.json({ sessions });
  } catch (error) {
    console.error('Error in GET /sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/sessions/:id - Get specific session
router.get('/sessions/:id', validateRequest({ params: sessionIdParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { session, error } = await ChatService.getSession(id, req.userId);

    if (error) {
      res.status(404).json({ error });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error('Error in GET /sessions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat/sessions - Create new session
router.post('/sessions', validateRequest({ body: createSessionBodySchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, selectedModel } = req.body;

    const { session, error } = await ChatService.createSession(
      req.userId,
      title,
      selectedModel
    );

    if (error || !session) {
      res.status(500).json({ error: error || 'Failed to create session' });
      return;
    }

    // Send response first, then log activity asynchronously (don't block response)
    res.status(201).json({ session });

    // Log activity asynchronously (fire and forget)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    AdminService.logActivity(
      req.userId!,
      'chat_session_created',
      { sessionId: session.id, title: session.title, model: session.selectedModel },
      ipAddress,
      userAgent
    ).catch(err => {
      console.error('Error logging activity (non-blocking):', err);
    });
  } catch (error) {
    console.error('Error in POST /sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/chat/sessions/:id - Update session
router.put(
  '/sessions/:id',
  validateRequest({ params: sessionIdParamsSchema, body: updateSessionBodySchema }),
  async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const sessionData: Partial<ChatSession> = req.body;

    // Verify session belongs to user
    const { session: existingSession, error: fetchError } = await ChatService.getSession(id, req.userId);

    if (fetchError || !existingSession) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Merge with existing session
    const updatedSession: ChatSession = {
      ...existingSession,
      ...sessionData,
      id, // Ensure ID doesn't change
      userId: req.userId, // Ensure userId doesn't change
    };

    const { error } = await ChatService.updateSession(updatedSession);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Send response first, then log activity asynchronously
    res.json({ session: updatedSession });

    // Log activity asynchronously (fire and forget)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    AdminService.logActivity(
      req.userId!,
      'chat_session_updated',
      { sessionId: id, title: updatedSession.title, model: updatedSession.selectedModel, messageCount: updatedSession.messages?.length || 0 },
      ipAddress,
      userAgent
    ).catch(err => {
      console.error('Error logging activity (non-blocking):', err);
    });
  } catch (error) {
    console.error('Error in PUT /sessions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/chat/sessions/:id - Delete session
router.delete('/sessions/:id', validateRequest({ params: sessionIdParamsSchema }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { error } = await ChatService.deleteSession(id, req.userId);

    if (error) {
      res.status(500).json({ error });
      return;
    }

    // Send response first, then log activity asynchronously
    res.json({ success: true });

    // Log activity asynchronously (fire and forget)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    AdminService.logActivity(
      req.userId!,
      'chat_session_deleted',
      { sessionId: id },
      ipAddress,
      userAgent
    ).catch(err => {
      console.error('Error logging activity (non-blocking):', err);
    });
  } catch (error) {
    console.error('Error in DELETE /sessions/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


