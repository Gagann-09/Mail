import { create } from 'zustand';
import { db, LocalMessage } from '../db/schema';

export interface LocalConversation {
  id: string; // threadId
  subject: string;
  messages: LocalMessage[];
  updatedAt: Date;
}

interface MailState {
  messages: LocalMessage[];
  conversations: LocalConversation[];
  loading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  isComposing: boolean;
  fetchMessages: () => Promise<void>;
  selectConversation: (id: string | null) => void;
  setComposing: (isComposing: boolean) => void;
  sendMessage: (to: string, subject: string, body: string, isWaiting: boolean) => Promise<void>;
}

function computeConversations(messages: LocalMessage[]): LocalConversation[] {
  const map = new Map<string, LocalMessage[]>();
  messages.forEach(msg => {
    if (!map.has(msg.threadId)) {
      map.set(msg.threadId, []);
    }
    map.get(msg.threadId)!.push(msg);
  });
  
  const convos: LocalConversation[] = [];
  map.forEach((msgs, threadId) => {
    msgs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lastMsg = msgs[msgs.length - 1];
    convos.push({
      id: threadId,
      subject: lastMsg.subject,
      messages: msgs,
      updatedAt: lastMsg.date
    });
  });
  
  convos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return convos;
}

export const useMailStore = create<MailState>((set) => ({
  messages: [],
  conversations: [],
  loading: false,
  error: null,
  isComposing: false,
  selectedConversationId: null,
  selectConversation: (id) => set({ selectedConversationId: id }),
  setComposing: (isComposing) => set({ isComposing }),
  sendMessage: async (to, subject, body, isWaiting) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, isWaiting })
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      // Re-fetch messages after sending
      const { fetchMessages } = useMailStore.getState();
      await fetchMessages();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
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
      const conversations = computeConversations(allMessages);
      set({ messages: allMessages, conversations, loading: false });
    } catch (err) {
      console.error(err);
      // Fallback to local DB if offline or error
      const allMessages = await db.messages.orderBy('date').reverse().toArray();
      const conversations = computeConversations(allMessages);
      set({ 
        messages: allMessages, 
        conversations,
        loading: false, 
        error: allMessages.length === 0 ? 'Failed to load messages' : null 
      });
    }
  }
}));
