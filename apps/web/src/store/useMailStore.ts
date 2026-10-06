import { create } from 'zustand';
import { db, LocalMessage } from '../db/schema';

export interface LocalConversation {
  id: string; // threadId
  subject: string;
  messages: LocalMessage[];
  updatedAt: Date;
}

export interface ComposeDefaults {
  to: string;
  subject: string;
  threadId?: string;
}

export interface Draft {
  to: string;
  subject: string;
  body: string;
  isWaiting: boolean;
  threadId?: string;
}

interface MailState {
  messages: LocalMessage[];
  conversations: LocalConversation[];
  loading: boolean;
  error: string | null;
  selectedConversationId: string | null;
  isComposing: boolean;
  composeDefaults: ComposeDefaults | null;
  drafts: Record<string, Draft>;
  searchQuery: string;
  fetchMessages: () => Promise<void>;
  selectConversation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setComposing: (isComposing: boolean, defaults?: ComposeDefaults) => void;
  saveDraft: (key: string, draft: Draft) => void;
  clearDraft: (key: string) => void;
  sendMessage: (to: string, subject: string, body: string, isWaiting: boolean, threadId?: string) => Promise<void>;
  archiveConversation: (threadId: string) => Promise<void>;
  trashConversation: (threadId: string) => Promise<void>;
  spamConversation: (threadId: string) => Promise<void>;
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
  
  // Filter for INBOX only
  const inboxConvos = convos.filter(c => c.messages.some(m => m.labels?.includes('INBOX')));
  
  inboxConvos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return inboxConvos;
}

export const useMailStore = create<MailState>((set) => ({
  messages: [],
  conversations: [],
  loading: false,
  error: null,
  isComposing: false,
  composeDefaults: null,
  drafts: {},
  searchQuery: '',
  selectedConversationId: null,
  selectConversation: (id) => set({ selectedConversationId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setComposing: (isComposing, defaults = null) => set({ isComposing, composeDefaults: defaults }),
  saveDraft: (key, draft) => set((state) => ({ drafts: { ...state.drafts, [key]: draft } })),
  clearDraft: (key) => set((state) => {
    const newDrafts = { ...state.drafts };
    delete newDrafts[key];
    return { drafts: newDrafts };
  }),
  sendMessage: async (to, subject, body, isWaiting, threadId) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, isWaiting, threadId })
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
  archiveConversation: async (threadId) => {
    try {
      const state = useMailStore.getState();
      const convo = state.conversations.find(c => c.id === threadId);
      if (!convo) return;

      const providerIds = convo.messages.map(m => m.providerId);
      
      // Optimistic UI update
      set(s => {
        const newConvos = s.conversations.filter(c => c.id !== threadId);
        return {
          conversations: newConvos,
          selectedConversationId: s.selectedConversationId === threadId ? null : s.selectedConversationId
        };
      });

      const response = await fetch('/api/messages/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerIds, action: 'archive' })
      });
      if (!response.ok) throw new Error('Archive failed');

      // Sync from truth
      await state.fetchMessages();
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure by fetching again
      await useMailStore.getState().fetchMessages();
    }
  },
  trashConversation: async (threadId) => {
    try {
      const state = useMailStore.getState();
      const convo = state.conversations.find(c => c.id === threadId);
      if (!convo) return;

      const providerIds = convo.messages.map(m => m.providerId);
      
      // Optimistic UI update
      set(s => {
        const newConvos = s.conversations.filter(c => c.id !== threadId);
        return {
          conversations: newConvos,
          selectedConversationId: s.selectedConversationId === threadId ? null : s.selectedConversationId
        };
      });

      const response = await fetch('/api/messages/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerIds, action: 'trash' })
      });
      if (!response.ok) throw new Error('Trash failed');

      // Sync from truth
      await state.fetchMessages();
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure by fetching again
      await useMailStore.getState().fetchMessages();
    }
  },
  spamConversation: async (threadId) => {
    try {
      const state = useMailStore.getState();
      const convo = state.conversations.find(c => c.id === threadId);
      if (!convo) return;

      const providerIds = convo.messages.map(m => m.providerId);
      
      // Optimistic UI update
      set(s => {
        const newConvos = s.conversations.filter(c => c.id !== threadId);
        return {
          conversations: newConvos,
          selectedConversationId: s.selectedConversationId === threadId ? null : s.selectedConversationId
        };
      });

      const response = await fetch('/api/messages/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerIds, action: 'spam' })
      });
      if (!response.ok) throw new Error('Spam reporting failed');

      // Sync from truth
      await state.fetchMessages();
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure by fetching again
      await useMailStore.getState().fetchMessages();
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
