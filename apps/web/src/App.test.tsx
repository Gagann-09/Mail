import { render, screen } from '@testing-library/react';
import { App } from './App';
import { describe, it, expect, vi } from 'vitest';

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
  })),
}));

describe('App Shell', () => {
  it('renders the sidebar and main content areas', () => {
    render(<App />);
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getAllByText('Attention').length).toBeGreaterThan(0);
  });
});
