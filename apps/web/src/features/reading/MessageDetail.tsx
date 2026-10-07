import { useMailStore } from '../../store/useMailStore';
import DOMPurify from 'dompurify';

export function MessageDetail() {
  const { conversations, selectedConversationId } = useMailStore();

  const conversation = conversations.find(c => c.id === selectedConversationId);

  if (!selectedConversationId || !conversation) {
    return (
      <div 
        data-testid="empty-detail"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: 'var(--text-medium)',
          fontSize: '14px'
        }}
      >
        Select a conversation to read
      </div>
    );
  }

  return (
    <article data-testid="conversation-detail" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            className="mobile-back-btn" 
            data-testid="mobile-back-btn"
            onClick={() => useMailStore.getState().selectConversation(null)}
            aria-label="Back to messages"
          >
            ←
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-high)', margin: 0 }}>
            {conversation.subject}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            data-testid="later-btn"
            onClick={() => useMailStore.getState().toggleLater(conversation.id)}
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: conversation.messages.some(m => m.labels?.includes('LATER')) ? 'var(--bg-secondary)' : 'transparent', color: 'var(--text-high)', cursor: 'pointer', fontWeight: 500 }}
          >
            {conversation.messages.some(m => m.labels?.includes('LATER')) ? 'Remove Later' : 'Mark Later'}
          </button>
          <button
            data-testid="waiting-btn"
            onClick={() => useMailStore.getState().toggleWaiting(conversation.id)}
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: conversation.messages.some(m => m.labels?.includes('WAITING')) ? 'var(--bg-secondary)' : 'transparent', color: 'var(--text-high)', cursor: 'pointer', fontWeight: 500 }}
          >
            {conversation.messages.some(m => m.labels?.includes('WAITING')) ? 'Remove Waiting' : 'Mark Waiting'}
          </button>
          <button
            data-testid="archive-btn"
            onClick={() => useMailStore.getState().archiveConversation(conversation.id)}
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', fontWeight: 500 }}
          >
            Archive
          </button>
          <button
            data-testid="trash-btn"
            onClick={() => useMailStore.getState().trashConversation(conversation.id)}
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: 'transparent', color: 'var(--status-destructive)', cursor: 'pointer', fontWeight: 500 }}
          >
            Trash
          </button>
          <button
            data-testid="spam-btn"
            onClick={() => useMailStore.getState().spamConversation(conversation.id)}
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: 'transparent', color: 'var(--text-medium)', cursor: 'pointer', fontWeight: 500 }}
          >
            Report Spam
          </button>
        </div>
      </header>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {conversation.messages.map((message, index) => (
          <div key={message.id} data-testid={`message-${message.id}`} style={{ borderBottom: index < conversation.messages.length - 1 ? 'var(--border-default)' : 'none', paddingBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)', fontSize: '14px', marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-high)' }}>{message.from.name || message.from.email}</span>
                <span style={{ marginLeft: 'var(--space-2)' }}>&lt;{message.from.email}&gt;</span>
              </div>
              <time dateTime={message.date.toString()}>
                {new Date(message.date).toLocaleString()}
              </time>
            </div>
            {message.hasAttachments && message.attachments && message.attachments.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                {message.attachments.map(att => (
                  <div key={att.id} data-testid={`attachment-${att.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 500 }}>{att.filename}</span>
                    <span style={{ color: 'var(--text-medium)' }}>({Math.round(att.size / 1024)} KB)</span>
                  </div>
                ))}
              </div>
            )}
            <div 
              style={{ color: 'var(--text-high)', fontSize: '15px', lineHeight: 1.6 }}
              data-testid={`message-body-${message.id}`}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.bodyHtml || message.snippet || '') }} 
            />
          </div>
        ))}
      </div>
      
      <footer style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)' }}>
        <button 
          data-testid="reply-btn"
          onClick={() => {
            const lastMsg = conversation.messages[conversation.messages.length - 1];
            useMailStore.getState().setComposing(true, {
              to: lastMsg.from.email,
              subject: conversation.subject.startsWith('Re:') ? conversation.subject : `Re: ${conversation.subject}`,
              threadId: conversation.id
            });
          }}
          style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: 'var(--border-default)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-high)', cursor: 'pointer', fontWeight: 500 }}
        >
          Reply
        </button>
      </footer>
    </article>
  );
}
