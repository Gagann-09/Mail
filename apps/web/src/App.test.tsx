import { render, screen } from '@testing-library/react';
import { App } from './App';
import { describe, it, expect, vi } from 'vitest';
import { useMailStore } from './store/useMailStore';

vi.mock('./store/useMailStore', () => ({
  useMailStore: vi.fn(() => ({
    messages: [],
    conversations: [],
    loading: false,
    error: null,
    fetchMessages: vi.fn(),
    selectedConversationId: null,
    selectConversation: vi.fn(),
    isComposing: false,
    setComposing: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    toastMessage: null,
    undoAction: null,
    currentView: 'attention',
    setCurrentView: vi.fn(),
  })),
}));

describe('App Shell', () => {
  it('renders the sidebar and main content areas', () => {
    render(<App />);
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getAllByText('Attention').length).toBeGreaterThan(0);
  });

  it('renders undo toast when toastMessage is present', () => {
    const mockUndo = vi.fn();
    vi.mocked(useMailStore).mockReturnValueOnce({
      messages: [],
      conversations: [],
      loading: false,
      error: null,
      fetchMessages: vi.fn(),
      selectedConversationId: null,
      selectConversation: vi.fn(),
      isComposing: false,
      setComposing: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      toastMessage: 'Test Toast',
      undoAction: mockUndo,
    } as any);

    render(<App />);
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    
    const undoBtn = screen.getByTestId('undo-btn');
    undoBtn.click();
    expect(mockUndo).toHaveBeenCalled();
  });
});
