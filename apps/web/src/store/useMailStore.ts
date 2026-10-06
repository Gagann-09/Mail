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
  spamConversation: (threadId: string) => void;
  toastMessage: string | null;
  undoAction: (() => void) | null;
  clearToast: () => void;
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

let pendingActionTimeout: any = null;
let commitPendingAction: (() => void) | null = null;

function handleOptimisticMutate(threadId: string, action: 'archive' | 'trash' | 'spam', toastText: string) {
  const state = useMailStore.getState();
  const convo = state.conversations.find(c => c.id === threadId);
  if (!convo) return;
  const providerIds = convo.messages.map(m => m.providerId);
  
  if (commitPendingAction) commitPendingAction();

  const originalConvos = state.conversations;
  const originalSelectedId = state.selectedConversationId;

  useMailStore.setState({
    conversations: state.conversations.filter(c => c.id !== threadId),
    selectedConversationId: state.selectedConversationId === threadId ? null : state.selectedConversationId,
    toastMessage: toastText
  });

  const commitApi = async () => {
    try {
      const response = await fetch('/api/messages/mutate', { method: 'POST', body: JSON.stringify({ providerIds, action }), headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`${action} failed`);
      await useMailStore.getState().fetchMessages();
    } catch (err) {
      console.error(err);
      await useMailStore.getState().fetchMessages(); // Revert on failure
    }
    useMailStore.getState().clearToast();
    commitPendingAction = null;
  };

  commitPendingAction = commitApi;
  pendingActionTimeout = setTimeout(() => {
     if (commitPendingAction === commitApi) commitApi();
  }, 5000);

  useMailStore.setState({
    undoAction: () => {
      if (pendingActionTimeout) clearTimeout(pendingActionTimeout);
      if (commitPendingAction === commitApi) {
        commitPendingAction = null;
        useMailStore.setState({ conversations: originalConvos, selectedConversationId: originalSelectedId });
        useMailStore.getState().clearToast();
      }
    }
  });
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
  toastMessage: null,
  undoAction: null,
  clearToast: () => set({ toastMessage: null, undoAction: null }),
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
  archiveConversation: (threadId) => handleOptimisticMutate(threadId, 'archive', 'Conversation archived'),
  trashConversation: (threadId) => handleOptimisticMutate(threadId, 'trash', 'Conversation moved to trash'),
  spamConversation: (threadId) => handleOptimisticMutate(threadId, 'spam', 'Conversation marked as spam'),
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
