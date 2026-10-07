import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttachmentList } from './AttachmentList';
import * as storeModule from '../../store/useMailStore';

vi.mock('../../store/useMailStore');

describe('AttachmentList', () => {
  const mockFetchMessages = vi.fn();
  const mockSelectConversation = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading state', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      attachments: [],
      loading: true,
      error: null,
      fetchMessages: mockFetchMessages,
      selectConversation: mockSelectConversation,
      selectedConversationId: null,
      searchQuery: '',
    } as any);

    render(<AttachmentList />);
    expect(screen.getByTestId('loading-state')).toBeDefined();
  });

  it('renders error state', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      attachments: [],
      loading: false,
      error: 'Failed to load',
      fetchMessages: mockFetchMessages,
      selectConversation: mockSelectConversation,
      selectedConversationId: null,
      searchQuery: '',
    } as any);

    render(<AttachmentList />);
    expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load');
  });

  it('renders empty state', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      attachments: [],
      loading: false,
      error: null,
      fetchMessages: mockFetchMessages,
      selectConversation: mockSelectConversation,
      selectedConversationId: null,
      searchQuery: '',
    } as any);

    render(<AttachmentList />);
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No attachments in inbox.');
  });

  it('renders list of attachments', () => {
    const mockAttachments = [
      {
        id: 'att-1',
        filename: 'report.pdf',
        contentType: 'application/pdf',
        size: 10240,
        threadId: 't-1',
        messageId: 'm-1',
        date: new Date('2026-10-01T10:00:00Z'),
        from: { name: 'Alice', email: 'alice@test.com' }
      }
    ];

    vi.mocked(storeModule.useMailStore).mockReturnValue({
      attachments: mockAttachments,
      loading: false,
      error: null,
      fetchMessages: mockFetchMessages,
      selectConversation: mockSelectConversation,
      selectedConversationId: null,
      searchQuery: '',
    } as any);

    render(<AttachmentList />);
    expect(screen.getByTestId('attachment-list')).toBeDefined();
    expect(screen.getByText('report.pdf')).toBeDefined();
    expect(screen.getByText('10 KB • application/pdf')).toBeDefined();
  });

  it('calls selectConversation when an attachment is clicked', () => {
    const mockAttachments = [
      {
        id: 'att-1',
        filename: 'report.pdf',
        contentType: 'application/pdf',
        size: 10240,
        threadId: 't-1',
        messageId: 'm-1',
        date: new Date('2026-10-01T10:00:00Z'),
        from: { name: 'Alice', email: 'alice@test.com' }
      }
    ];

    vi.mocked(storeModule.useMailStore).mockReturnValue({
      attachments: mockAttachments,
      loading: false,
      error: null,
      fetchMessages: mockFetchMessages,
      selectConversation: mockSelectConversation,
      selectedConversationId: null,
      searchQuery: '',
    } as any);

    render(<AttachmentList />);
    const btn = screen.getByTestId('attachment-att-1');
    btn.click();
    expect(mockSelectConversation).toHaveBeenCalledWith('t-1');
  });
});
