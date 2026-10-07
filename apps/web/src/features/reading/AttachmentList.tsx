import { useEffect } from 'react';
import { useMailStore } from '../../store/useMailStore';

export function AttachmentList() {
  const { attachments, loading, error, fetchMessages, selectConversation, selectedConversationId, searchQuery } = useMailStore();

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (loading && attachments.length === 0) {
    return <div data-testid="loading-state" style={{ color: 'var(--text-medium)' }}>Loading attachments...</div>;
  }

  if (error && attachments.length === 0) {
    return <div data-testid="error-state" style={{ color: 'var(--status-destructive)' }}>{error}</div>;
  }

  if (attachments.length === 0) {
    return <div data-testid="empty-state" style={{ color: 'var(--text-medium)' }}>{searchQuery ? 'No attachments found.' : 'No attachments in inbox.'}</div>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }} data-testid="attachment-list">
      {attachments.map(att => {
        const isSelected = att.threadId === selectedConversationId;
        
        return (
        <li key={att.id}>
          <button 
            onClick={() => selectConversation(att.threadId)}
            data-testid={`attachment-${att.id}`}
            aria-label={`Attachment: ${att.filename}, size ${Math.round(att.size / 1024)} KB`}
            aria-selected={isSelected}
            style={{ 
              width: '100%',
              textAlign: 'left',
              border: 'none',
              padding: 'var(--space-4)', 
              borderBottom: 'var(--border-default)',
              cursor: 'pointer',
              backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {att.filename}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-medium)' }}>
                {new Date(att.date).toLocaleDateString()}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-medium)' }}>
              {Math.round(att.size / 1024)} KB &bull; {att.contentType}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-medium)', marginTop: 'var(--space-2)' }}>
              From: {att.from.name || att.from.email}
            </div>
          </button>
        </li>
        );
      })}
    </ul>
  );
}
