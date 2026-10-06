import express from 'express';
import cors from 'cors';

import { authRouter } from './api/routes/auth';
import { messagesRouter } from './api/routes/messages';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Mail Backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/messages', messagesRouter);

app.listen(port, () => {
  console.log(`Mail service listening on port ${port}`);
});
