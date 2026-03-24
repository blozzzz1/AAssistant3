import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import generationsRoutes from './routes/generations';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';
import settingsRoutes from './routes/settings';
import paymentRoutes from './routes/payment';
import transactionsRoutes from './routes/transactions';
import aiProxyRoutes from './routes/aiProxy';
import { requestLogger, RequestWithId } from './middleware/requestLogger';
import { appLogger } from './lib/logger';
import { adminLimiter, aiLimiter, apiLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Trust exactly one proxy hop by default (safe for rate-limit keying by IP).
// Override with TRUST_PROXY_HOPS in environments with a different proxy chain.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? '1');
app.set('trust proxy', Number.isFinite(trustProxyHops) && trustProxyHops >= 0 ? trustProxyHops : 1);

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Request logging (requestId + log on finish)
app.use(requestLogger);

// AI proxy routes MUST be before express.json() so multipart body is not consumed
app.use('/api/ai', aiLimiter, aiProxyRoutes);

// Increase payload size limit for chat messages (default is 100kb, increase to 10mb)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/generations', apiLimiter, generationsRoutes);
app.use('/api/user', apiLimiter, userRoutes);
app.use('/api/settings', apiLimiter, settingsRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/payment', apiLimiter, paymentRoutes);
app.use('/api/transactions', apiLimiter, transactionsRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const withId = req as RequestWithId;
  appLogger.error({
    message: err.message,
    stack: err.stack,
    requestId: withId.id,
    path: req.path,
    method: req.method,
    userId: (req as express.Request & { userId?: string }).userId,
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.ELASTICSEARCH_URL) {
    console.log('📋 Elasticsearch logging enabled');
  }
});

