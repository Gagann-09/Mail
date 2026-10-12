import express from 'express';
import cors from 'cors';

import { authRouter } from './api/routes/auth';
import { messagesRouter } from './api/routes/messages';

export function createApp(): express.Express {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.use(cors({
    origin: frontendUrl,
    credentials: true
  }));
  app.use(express.json());

  // CSRF Protection Middleware
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        return res.status(403).json({ error: 'CSRF protection: missing or invalid x-requested-with header' });
      }
    }
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Mail Backend' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/messages', messagesRouter);

  return app;
}

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Mail service listening on port ${port}`);
  });
}

export default app;
