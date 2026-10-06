import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageList } from './MessageList';
import * as storeModule from '../../store/useMailStore';
import { LocalMessage } from '../../db/schema';

// Mock the Zustand store hook
vi.mock('../../store/useMailStore', () => ({
  useMailStore: vi.fn(),
}));

describe('MessageList', () => {
  const mockFetchMessages = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      loading: true,
      error: null,
      fetchMessages: mockFetchMessages,
    });

    render(<MessageList />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(mockFetchMessages).toHaveBeenCalled();
  });

  it('renders error state', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      loading: false,
      error: 'Network Error',
      fetchMessages: mockFetchMessages,
    });

    render(<MessageList />);
    expect(screen.getByTestId('error-state')).toHaveTextContent('Network Error');
  });

  it('renders empty state when no messages', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [],
      loading: false,
      error: null,
      fetchMessages: mockFetchMessages,
    });

    render(<MessageList />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders list of messages', () => {
    const mockMessages: LocalMessage[] = [
      {
        id: '1',
        providerId: 'p-1',
        threadId: 't-1',
        from: { name: 'Alice', email: 'alice@test.com' },
        to: [{ email: 'me@test.com' }],
        subject: 'Hello World',
        snippet: 'This is a test snippet',
        date: new Date('2023-01-01T12:00:00Z'),
        hasAttachments: false,
      },
    ];

    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: mockMessages,
      loading: false,
      error: null,
      fetchMessages: mockFetchMessages,
    });

    render(<MessageList />);
    
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('This is a test snippet')).toBeInTheDocument();
  });
});
