import { Router, Request, Response } from 'express';
import { DemoProvider } from '../../providers/demoProvider';

export const messagesRouter = Router();

// In a real app, this would be a singleton or instantiated per-user via middleware.
// For the demo, we instantiate it here to serve the initial list.
const provider = new DemoProvider();

messagesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = await provider.syncMailbox();
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});
