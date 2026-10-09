import express from 'express';
import cors from 'cors';

import { authRouter } from './api/routes/auth';
import { messagesRouter } from './api/routes/messages';

const app = express();
const port = process.env.PORT || 3000;
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

app.listen(port, () => {
  console.log(`Mail service listening on port ${port}`);
});
