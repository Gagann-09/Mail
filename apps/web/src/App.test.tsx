import { render, screen } from '@testing-library/react';
import { App } from './App';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./store/useMailStore', () => ({
  useMailStore: vi.fn(() => ({
    messages: [],
    loading: false,
    error: null,
    fetchMessages: vi.fn(),
  })),
}));

describe('App Shell', () => {
  it('renders the sidebar and main content areas', () => {
    render(<App />);
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getAllByText('Attention').length).toBeGreaterThan(0);
  });
});
