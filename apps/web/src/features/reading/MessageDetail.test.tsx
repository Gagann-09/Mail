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
        hasAttachments: false,
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
});
