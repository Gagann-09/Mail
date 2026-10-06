import { create } from 'zustand';
import { db, LocalMessage } from '../db/schema';

interface MailState {
  messages: LocalMessage[];
  loading: boolean;
  error: string | null;
  selectedMessageId: string | null;
  fetchMessages: () => Promise<void>;
  selectMessage: (id: string | null) => void;
}

export const useMailStore = create<MailState>((set) => ({
  messages: [],
  loading: false,
  error: null,
  selectedMessageId: null,
  selectMessage: (id) => set({ selectedMessageId: id }),
  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }
      const data = await response.json();
      const fetchedMessages: LocalMessage[] = data.data;

      // Update Local IndexedDB
      await db.messages.bulkPut(fetchedMessages);

      // Update React State
      const allMessages = await db.messages.orderBy('date').reverse().toArray();
      set({ messages: allMessages, loading: false });
    } catch (err) {
      console.error(err);
      // Fallback to local DB if offline or error
      const allMessages = await db.messages.orderBy('date').reverse().toArray();
      set({ 
        messages: allMessages, 
        loading: false, 
        error: allMessages.length === 0 ? 'Failed to load messages' : null 
      });
    }
  }
}));
