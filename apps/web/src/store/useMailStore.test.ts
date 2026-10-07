import { describe, it, expect, beforeEach } from 'vitest';
import { useMailStore } from './useMailStore';

describe('Attention States (useMailStore)', () => {
  const mockMessages = [
    {
      id: 'm1',
      providerId: 'p1',
      threadId: 't1',
      from: { email: 'a@example.com' },
      to: [],
      cc: [],
      bcc: [],
      subject: 'Attention thread',
      snippet: 'test',
      date: new Date(),
      labels: ['INBOX'], // Should be in Attention
      hasAttachments: false,
    },
    {
      id: 'm2',
      providerId: 'p2',
      threadId: 't2',
      from: { email: 'b@example.com' },
      to: [],
      cc: [],
      bcc: [],
      subject: 'Waiting thread',
      snippet: 'test',
      date: new Date(),
      labels: ['INBOX', 'WAITING'], // Should be in Waiting, not Attention
      hasAttachments: false,
    },
    {
      id: 'm3',
      providerId: 'p3',
      threadId: 't3',
      from: { email: 'c@example.com' },
      to: [],
      cc: [],
      bcc: [],
      subject: 'Later thread',
      snippet: 'test',
      date: new Date(),
      labels: ['INBOX', 'LATER'], // Should be in Later, not Attention
      hasAttachments: false,
    },
    {
      id: 'm4',
      providerId: 'p4',
      threadId: 't4',
      from: { email: 'd@example.com' },
      to: [],
      cc: [],
      bcc: [],
      subject: 'Archived thread',
      snippet: 'test',
      date: new Date(),
      labels: ['ARCHIVE'], // Should be in All Mail, not Attention
      hasAttachments: false,
    }
  ];

  beforeEach(() => {
    useMailStore.setState({ messages: mockMessages as any });
  });

  it('filters Attention view correctly', () => {
    useMailStore.getState().setCurrentView('attention');
    const { conversations, currentView } = useMailStore.getState();
    expect(currentView).toBe('attention');
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t1');
  });

  it('filters Waiting view correctly', () => {
    useMailStore.getState().setCurrentView('waiting');
    const { conversations, currentView } = useMailStore.getState();
    expect(currentView).toBe('waiting');
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t2');
  });

  it('filters Later view correctly', () => {
    useMailStore.getState().setCurrentView('later');
    const { conversations, currentView } = useMailStore.getState();
    expect(currentView).toBe('later');
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t3');
  });

  it('shows all non-trash mail in All Mail view', () => {
    useMailStore.getState().setCurrentView('all');
    const { conversations, currentView } = useMailStore.getState();
    expect(currentView).toBe('all');
    expect(conversations.length).toBe(4);
  });

  it('filters by search query (subject)', () => {
    useMailStore.getState().setCurrentView('all');
    useMailStore.getState().setSearchQuery('Waiting');
    const { conversations } = useMailStore.getState();
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t2');
  });

  it('filters by search query (sender email)', () => {
    useMailStore.getState().setCurrentView('all');
    useMailStore.getState().setSearchQuery('a@example.com');
    const { conversations } = useMailStore.getState();
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t1');
  });

  it('filters by search query ignoring case', () => {
    useMailStore.getState().setCurrentView('all');
    useMailStore.getState().setSearchQuery('ARCHIVED');
    const { conversations } = useMailStore.getState();
    expect(conversations.length).toBe(1);
    expect(conversations[0].id).toBe('t4');
  });
});
