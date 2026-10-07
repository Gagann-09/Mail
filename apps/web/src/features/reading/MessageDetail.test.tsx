import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageDetail } from './MessageDetail';
import * as storeModule from '../../store/useMailStore';
import { LocalConversation } from '../../store/useMailStore';

vi.mock('../../store/useMailStore', () => ({
  useMailStore: vi.fn(),
}));

describe('MessageDetail', () => {
  const mockConvo: LocalConversation = {
    id: 't-1',
    subject: 'Hello World',
    updatedAt: new Date('2023-01-01T12:00:00Z'),
    messages: [
      {
        id: '1',
        providerId: 'p-1',
        threadId: 't-1',
        from: { name: 'Alice', email: 'alice@test.com' },
        to: [{ email: 'me@test.com' }],
        subject: 'Hello World',
        snippet: 'This is a test snippet',
        bodyHtml: '<p>This is the full body</p>',
        date: new Date('2023-01-01T12:00:00Z'),
        hasAttachments: true,
        attachments: [
          { id: 'att-1', filename: 'test_file.pdf', contentType: 'application/pdf', size: 2048 }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty state when no conversation is selected', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: null,
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
    });

    render(<MessageDetail />);
    expect(screen.getByTestId('empty-detail')).toBeInTheDocument();
    expect(screen.getByText('Select a conversation to read')).toBeInTheDocument();
  });

  it('renders conversation content when a conversation is selected', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
    });

    render(<MessageDetail />);
    
    expect(screen.getByTestId('conversation-detail')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('<alice@test.com>')).toBeInTheDocument();
    
    expect(screen.getByTestId('message-body-1')).toHaveTextContent('This is the full body');
  });

  it('falls back to snippet if bodyHtml is missing', () => {
    const snippetOnlyConvo = {
      ...mockConvo,
      messages: [{ ...mockConvo.messages[0], bodyHtml: undefined }]
    };
    
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [snippetOnlyConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
    });

    render(<MessageDetail />);
    
    expect(screen.getByTestId('message-body-1')).toHaveTextContent('This is a test snippet');
  });

  it('triggers setComposing with defaults when Reply is clicked', () => {
    const mockSetComposing = vi.fn();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: mockSetComposing,
      sendMessage: vi.fn()
    });
    
    storeModule.useMailStore.getState = vi.fn().mockReturnValue({ setComposing: mockSetComposing });
    
    const { getByTestId } = render(<MessageDetail />);
    
    const replyBtn = getByTestId('reply-btn');
    replyBtn.click();
    
    expect(mockSetComposing).toHaveBeenCalledWith(true, {
      to: 'alice@test.com',
      subject: 'Re: Hello World',
      threadId: 't-1'
    });
  });

  it('renders attachments if present', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      drafts: {},
      searchQuery: '',
      setSearchQuery: vi.fn(),
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: vi.fn(),
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      sendMessage: vi.fn(),
      archiveConversation: vi.fn()
    });

    render(<MessageDetail />);
    expect(screen.getByTestId('attachment-att-1')).toBeInTheDocument();
    expect(screen.getByText('test_file.pdf')).toBeInTheDocument();
    expect(screen.getByText('(2 KB)')).toBeInTheDocument();
  });

  it('calls archiveConversation when Archive button is clicked', () => {
    const mockArchive = vi.fn();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      drafts: {},
      searchQuery: '',
      setSearchQuery: vi.fn(),
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: vi.fn(),
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      sendMessage: vi.fn(),
      archiveConversation: mockArchive,
      trashConversation: vi.fn()
    });
    
    storeModule.useMailStore.getState = vi.fn().mockReturnValue({ archiveConversation: mockArchive });

    render(<MessageDetail />);
    const archiveBtn = screen.getByTestId('archive-btn');
    archiveBtn.click();
    expect(mockArchive).toHaveBeenCalledWith('t-1');
  });

  it('calls trashConversation when Trash button is clicked', () => {
    const mockTrash = vi.fn();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      drafts: {},
      searchQuery: '',
      setSearchQuery: vi.fn(),
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: vi.fn(),
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      sendMessage: vi.fn(),
      archiveConversation: vi.fn(),
      trashConversation: mockTrash
    });
    
    storeModule.useMailStore.getState = vi.fn().mockReturnValue({ trashConversation: mockTrash });

    render(<MessageDetail />);
    const trashBtn = screen.getByTestId('trash-btn');
    trashBtn.click();
    expect(mockTrash).toHaveBeenCalledWith('t-1');
  });

  it('calls spamConversation when Report Spam button is clicked', () => {
    const mockSpam = vi.fn();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      drafts: {},
      searchQuery: '',
      setSearchQuery: vi.fn(),
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: vi.fn(),
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      sendMessage: vi.fn(),
      archiveConversation: vi.fn(),
      trashConversation: vi.fn(),
      spamConversation: mockSpam
    });
    
    storeModule.useMailStore.getState = vi.fn().mockReturnValue({ spamConversation: mockSpam });

    render(<MessageDetail />);
    const spamBtn = screen.getByTestId('spam-btn');
    spamBtn.click();
    expect(mockSpam).toHaveBeenCalledWith('t-1');
  });
  it('calls toggleWaiting when Waiting button is clicked', () => {
    const mockToggleWaiting = vi.fn();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      conversations: [mockConvo],
      selectedConversationId: 't-1',
      loading: false,
      error: null,
      isComposing: false,
      composeDefaults: null,
      drafts: {},
      searchQuery: '',
      setSearchQuery: vi.fn(),
      fetchMessages: vi.fn(),
      selectConversation: vi.fn(),
      setComposing: vi.fn(),
      saveDraft: vi.fn(),
      clearDraft: vi.fn(),
      sendMessage: vi.fn(),
      archiveConversation: vi.fn(),
      trashConversation: vi.fn(),
      spamConversation: vi.fn(),
      toggleWaiting: mockToggleWaiting
    });
    
    storeModule.useMailStore.getState = vi.fn().mockReturnValue({ toggleWaiting: mockToggleWaiting });

    render(<MessageDetail />);
    const waitingBtn = screen.getByTestId('waiting-btn');
    waitingBtn.click();
    expect(mockToggleWaiting).toHaveBeenCalledWith('t-1');
  });
});
