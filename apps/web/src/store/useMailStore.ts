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
  toggleWaiting: (threadId: string) => void;
  toggleLater: (threadId: string) => void;
  toastMessage: string | null;
  undoAction: (() => void) | null;
  currentView: 'attention' | 'waiting' | 'later' | 'all';
  setCurrentView: (view: 'attention' | 'waiting' | 'later' | 'all') => void;
  clearToast: () => void;
}

function computeConversations(messages: LocalMessage[], currentView: 'attention' | 'waiting' | 'later' | 'all'): LocalConversation[] {
  const map = new Map<string, LocalMessage[]>();
  // Pre-filter out trash and spam for all standard views
  const validMessages = messages.filter(m => !m.labels?.includes('TRASH') && !m.labels?.includes('SPAM'));
  
  validMessages.forEach(msg => {
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
  
  // Filter based on view
  let filteredConvos = convos;
  if (currentView === 'attention') {
    filteredConvos = convos.filter(c => c.messages.some(m => m.labels?.includes('INBOX') && !m.labels?.includes('WAITING') && !m.labels?.includes('LATER')));
  } else if (currentView === 'waiting') {
    filteredConvos = convos.filter(c => c.messages.some(m => m.labels?.includes('WAITING')));
  } else if (currentView === 'later') {
    filteredConvos = convos.filter(c => c.messages.some(m => m.labels?.includes('LATER')));
  }
  
  filteredConvos.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return filteredConvos;
}

let pendingActionTimeout: any = null;
let commitPendingAction: (() => void) | null = null;

type MutateAction = 'archive' | 'trash' | 'spam' | 'waiting' | 'remove_waiting' | 'later' | 'remove_later';

function handleOptimisticMutate(threadId: string, action: MutateAction, toastText: string) {
  const state = useMailStore.getState();
  const convo = state.conversations.find(c => c.id === threadId);
  if (!convo) return;
  const providerIds = convo.messages.map(m => m.providerId);
  
  if (commitPendingAction) commitPendingAction();

  const originalMessages = state.messages;
  const originalSelectedId = state.selectedConversationId;
  
  // Optimistically update labels in messages
  const newMessages = state.messages.map(m => {
    if (m.threadId !== threadId) return m;
    const newLabels = [...(m.labels || [])];
    
    if (action === 'archive') {
      const idx = newLabels.indexOf('INBOX');
      if (idx > -1) newLabels.splice(idx, 1);
      if (!newLabels.includes('ARCHIVE')) newLabels.push('ARCHIVE');
    } else if (action === 'trash') {
      const inIdx = newLabels.indexOf('INBOX');
      if (inIdx > -1) newLabels.splice(inIdx, 1);
      if (!newLabels.includes('TRASH')) newLabels.push('TRASH');
    } else if (action === 'spam') {
      const inIdx = newLabels.indexOf('INBOX');
      if (inIdx > -1) newLabels.splice(inIdx, 1);
      if (!newLabels.includes('SPAM')) newLabels.push('SPAM');
    } else if (action === 'waiting') {
      if (!newLabels.includes('WAITING')) newLabels.push('WAITING');
    } else if (action === 'remove_waiting') {
      const wIdx = newLabels.indexOf('WAITING');
      if (wIdx > -1) newLabels.splice(wIdx, 1);
    } else if (action === 'later') {
      if (!newLabels.includes('LATER')) newLabels.push('LATER');
    } else if (action === 'remove_later') {
      const wIdx = newLabels.indexOf('LATER');
      if (wIdx > -1) newLabels.splice(wIdx, 1);
    }
    
    return { ...m, labels: newLabels };
  });

  const newConversations = computeConversations(newMessages, state.currentView);
  const stillInView = newConversations.some(c => c.id === threadId);

  useMailStore.setState({
    messages: newMessages,
    conversations: newConversations,
    selectedConversationId: stillInView ? state.selectedConversationId : null,
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
        const revertedConversations = computeConversations(originalMessages, state.currentView);
        useMailStore.setState({ 
          messages: originalMessages,
          conversations: revertedConversations, 
          selectedConversationId: originalSelectedId 
        });
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
  currentView: 'attention',
  setCurrentView: (view) => set((state) => ({ 
    currentView: view, 
    conversations: computeConversations(state.messages, view),
    selectedConversationId: null // Reset selection on view change
  })),
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
  toggleWaiting: (threadId) => {
    const convo = useMailStore.getState().conversations.find(c => c.id === threadId);
    if (!convo) return;
    const isWaiting = convo.messages.some(m => m.labels?.includes('WAITING'));
    handleOptimisticMutate(threadId, isWaiting ? 'remove_waiting' : 'waiting', isWaiting ? 'Removed from waiting' : 'Marked as waiting');
  },
  toggleLater: (threadId) => {
    const convo = useMailStore.getState().conversations.find(c => c.id === threadId);
    if (!convo) return;
    const isLater = convo.messages.some(m => m.labels?.includes('LATER'));
    handleOptimisticMutate(threadId, isLater ? 'remove_later' : 'later', isLater ? 'Removed from later' : 'Marked for later');
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
      const state = useMailStore.getState();
      const conversations = computeConversations(allMessages, state.currentView);
      set({ messages: allMessages, conversations, loading: false });
    } catch (err) {
      console.error(err);
      // Fallback to local DB if offline or error
      const allMessages = await db.messages.orderBy('date').reverse().toArray();
      const state = useMailStore.getState();
      const conversations = computeConversations(allMessages, state.currentView);
      set({ 
        messages: allMessages, 
        conversations,
        loading: false, 
        error: allMessages.length === 0 ? 'Failed to load messages' : null 
      });
    }
  }
}));
