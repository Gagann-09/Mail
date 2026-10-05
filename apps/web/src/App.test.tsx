import { render, screen } from '@testing-library/react';
import { App } from './App';
import { describe, it, expect } from 'vitest';

describe('App Shell', () => {
  it('renders the sidebar and main content areas', () => {
    render(<App />);
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getAllByText('Attention').length).toBeGreaterThan(0);
  });
});
