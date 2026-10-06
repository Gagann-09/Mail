import { useEffect } from 'react';
import { useMailStore } from '../../store/useMailStore';

export function MessageList() {
  const { messages, loading, error, fetchMessages, selectMessage, selectedMessageId } = useMailStore();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (loading && messages.length === 0) {
    return <div data-testid="loading-state" style={{ color: 'var(--text-medium)' }}>Loading messages...</div>;
  }

  if (error && messages.length === 0) {
    return <div data-testid="error-state" style={{ color: 'var(--status-destructive)' }}>{error}</div>;
  }

  if (messages.length === 0) {
    return <div data-testid="empty-state" style={{ color: 'var(--text-medium)' }}>Inbox is empty.</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }} data-testid="message-list">
      {messages.map(msg => {
        const isSelected = msg.id === selectedMessageId;
        return (
        <li 
          key={msg.id} 
          onClick={() => selectMessage(msg.id)}
          data-testid={`msg-${msg.id}`}
          style={{ 
            padding: 'var(--space-4)', 
            borderBottom: 'var(--border-default)',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{msg.from.name || msg.from.email}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
              {new Date(msg.date).toLocaleDateString()}
            </span>
          </div>
          <div style={{ fontWeight: 500, color: 'var(--text-high)' }}>{msg.subject}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {msg.snippet}
          </div>
        </li>
        );
      })}
    </ul>
  );
}
