import { useMailStore } from '../../store/useMailStore';

export function MessageDetail() {
  const { messages, selectedMessageId } = useMailStore();

  const message = messages.find(m => m.id === selectedMessageId);

  if (!selectedMessageId || !message) {
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
        Select a message to read
      </div>
    );
  }

  return (
    <article data-testid="message-detail" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ borderBottom: 'var(--border-default)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-high)', marginBottom: 'var(--space-2)' }}>
          {message.subject}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-medium)', fontSize: '14px' }}>
          <div>
            <span style={{ fontWeight: 500, color: 'var(--text-high)' }}>{message.from.name || message.from.email}</span>
            <span style={{ marginLeft: 'var(--space-2)' }}>&lt;{message.from.email}&gt;</span>
          </div>
          <time dateTime={message.date.toString()}>
            {new Date(message.date).toLocaleString()}
          </time>
        </div>
      </header>
      
      <div 
        style={{ flex: 1, overflowY: 'auto', color: 'var(--text-high)', fontSize: '15px', lineHeight: 1.6 }}
        data-testid="message-body"
        dangerouslySetInnerHTML={{ __html: message.bodyHtml || message.snippet }} 
      />
    </article>
  );
}
