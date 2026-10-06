import { useEffect } from 'react';
import { useMailStore } from '../../store/useMailStore';

export function MessageList() {
  const { conversations, loading, error, fetchMessages, selectConversation, selectedConversationId } = useMailStore();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (loading && conversations.length === 0) {
    return <div data-testid="loading-state" style={{ color: 'var(--text-medium)' }}>Loading messages...</div>;
  }

  if (error && conversations.length === 0) {
    return <div data-testid="error-state" style={{ color: 'var(--status-destructive)' }}>{error}</div>;
  }

  if (conversations.length === 0) {
    return <div data-testid="empty-state" style={{ color: 'var(--text-medium)' }}>Inbox is empty.</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }} data-testid="message-list">
      {conversations.map(convo => {
        const isSelected = convo.id === selectedConversationId;
        const lastMsg = convo.messages[convo.messages.length - 1];
        const participantNames = Array.from(new Set(convo.messages.map(m => m.from.name || m.from.email))).join(', ');
        
        return (
        <li 
          key={convo.id} 
          onClick={() => selectConversation(convo.id)}
          data-testid={`convo-${convo.id}`}
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
            <span style={{ fontWeight: 600 }}>
              {participantNames} {convo.messages.length > 1 && <span style={{ color: 'var(--text-medium)', fontWeight: 'normal' }}>({convo.messages.length})</span>}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
              {new Date(convo.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ fontWeight: 500, color: 'var(--text-high)' }}>{convo.subject}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lastMsg.snippet}
          </div>
        </li>
        );
      })}
    </ul>
  );
}
