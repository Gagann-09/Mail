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

messagesRouter.post('/send', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body, threadId } = req.body;
    if (!to || !subject || !body) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    await provider.sendMessage({ to: Array.isArray(to) ? to : [to], subject, body, threadId });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

messagesRouter.post('/mutate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerIds, action } = req.body;
    if (!providerIds || !Array.isArray(providerIds) || !action) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    
    const validActions = ['archive', 'trash', 'read', 'unread'];
    if (!validActions.includes(action)) {
      res.status(400).json({ success: false, error: 'Invalid action' });
      return;
    }

    // In a real implementation we would handle bulk updates efficiently
    // For demo, we iterate
    for (const providerId of providerIds) {
      try {
        await provider.mutateMessage(providerId, action as any);
      } catch (err) {
        // Ignore individual failures for the demo
        console.error(`Failed to mutate message ${providerId}:`, err);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mutate messages' });
  }
});
