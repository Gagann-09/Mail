import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Composer } from './Composer';
import * as storeModule from '../../store/useMailStore';

vi.mock('../../store/useMailStore', () => ({
  useMailStore: vi.fn(),
}));

describe('Composer', () => {
  const mockSetComposing = vi.fn();
  const mockSendMessage = vi.fn();
  const mockSaveDraft = vi.fn();
  const mockClearDraft = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      isComposing: true,
      composeDefaults: null,
      setComposing: mockSetComposing,
      sendMessage: mockSendMessage,
      messages: [],
      conversations: [],
      drafts: {},
      saveDraft: mockSaveDraft,
      clearDraft: mockClearDraft,
      loading: false,
      error: null,
      selectedConversationId: null,
      selectConversation: vi.fn(),
      fetchMessages: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders form fields', () => {
    render(<Composer />);
    expect(screen.getByTestId('composer-modal')).toBeInTheDocument();
    expect(screen.getByTestId('composer-to')).toBeInTheDocument();
    expect(screen.getByTestId('composer-subject')).toBeInTheDocument();
    expect(screen.getByTestId('composer-body')).toBeInTheDocument();
    expect(screen.getByTestId('composer-waiting-toggle')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<Composer />);
    fireEvent.click(screen.getByTestId('close-composer'));
    expect(mockSetComposing).toHaveBeenCalledWith(false);
  });

  it('shows error if required fields are missing on send', async () => {
    render(<Composer />);
    fireEvent.click(screen.getByTestId('composer-send'));
    expect(screen.getByTestId('composer-error')).toHaveTextContent('To and Body are required');
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('calls sendMessage and closes on success', async () => {
    mockSendMessage.mockResolvedValueOnce(undefined);
    render(<Composer />);
    
    fireEvent.change(screen.getByTestId('composer-to'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('composer-subject'), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByTestId('composer-body'), { target: { value: 'Testing body' } });
    fireEvent.click(screen.getByTestId('composer-waiting-toggle')); // Set isWaiting to true

    fireEvent.click(screen.getByTestId('composer-send'));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('test@test.com', 'Hello', 'Testing body', true, undefined);
    });
    
    expect(mockSetComposing).toHaveBeenCalledWith(false);
  });

  it('shows error if send fails', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('Network error'));
    render(<Composer />);
    
    fireEvent.change(screen.getByTestId('composer-to'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByTestId('composer-body'), { target: { value: 'Testing body' } });

    fireEvent.click(screen.getByTestId('composer-send'));

    await waitFor(() => {
      expect(screen.getByTestId('composer-error')).toHaveTextContent('Failed to send. Please try again.');
    });
    expect(mockSetComposing).not.toHaveBeenCalled();
  });

  it('loads existing draft data on mount', () => {
    vi.mocked(storeModule.useMailStore).mockReturnValue({
      isComposing: true,
      composeDefaults: { to: 'default@test.com', subject: 'Default', threadId: 't-1' },
      setComposing: mockSetComposing,
      sendMessage: mockSendMessage,
      messages: [],
      conversations: [],
      drafts: {
        't-1': { to: 'draft@test.com', subject: 'Draft Sub', body: 'Draft body', isWaiting: false, threadId: 't-1' }
      },
      saveDraft: mockSaveDraft,
      clearDraft: mockClearDraft,
      loading: false,
      error: null,
      selectedConversationId: null,
      selectConversation: vi.fn(),
      fetchMessages: vi.fn(),
    });

    render(<Composer />);
    expect(screen.getByTestId('composer-to')).toHaveValue('draft@test.com');
    expect(screen.getByTestId('composer-subject')).toHaveValue('Draft Sub');
    expect(screen.getByTestId('composer-body')).toHaveValue('Draft body');
  });
});
