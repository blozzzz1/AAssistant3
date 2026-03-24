import rateLimit from 'express-rate-limit';

function createLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
    },
  });
}

export const apiLimiter = createLimiter(60 * 1000, 120);
export const aiLimiter = createLimiter(60 * 1000, 30);
export const adminLimiter = createLimiter(60 * 1000, 60);
