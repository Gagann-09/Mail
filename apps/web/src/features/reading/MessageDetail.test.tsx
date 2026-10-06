import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageDetail } from './MessageDetail';
import * as storeModule from '../../store/useMailStore';
import { LocalMessage } from '../../db/schema';

vi.mock('../../store/useMailStore', () => ({
  useMailStore: vi.fn(),
}));

describe('MessageDetail', () => {
  const mockMessage: LocalMessage = {
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
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty state when no message is selected', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [mockMessage],
      selectedMessageId: null,
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectMessage: vi.fn(),
    });

    render(<MessageDetail />);
    expect(screen.getByTestId('empty-detail')).toBeInTheDocument();
    expect(screen.getByText('Select a message to read')).toBeInTheDocument();
  });

  it('renders message content when a message is selected', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [mockMessage],
      selectedMessageId: '1',
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectMessage: vi.fn(),
    });

    render(<MessageDetail />);
    
    expect(screen.getByTestId('message-detail')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('<alice@test.com>')).toBeInTheDocument();
    
    // Check if inner HTML rendered correctly (the <p> tag text)
    expect(screen.getByTestId('message-body')).toHaveTextContent('This is the full body');
  });

  it('falls back to snippet if bodyHtml is missing', () => {
    const snippetOnlyMessage = { ...mockMessage, bodyHtml: undefined };
    
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      messages: [snippetOnlyMessage],
      selectedMessageId: '1',
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectMessage: vi.fn(),
    });

    render(<MessageDetail />);
    
    expect(screen.getByTestId('message-body')).toHaveTextContent('This is a test snippet');
  });
});
