import { useMailStore } from '../../store/useMailStore';

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
      <header style={{ paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-high)' }}>
          {conversation.subject}
        </h1>
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
            <div 
              style={{ color: 'var(--text-high)', fontSize: '15px', lineHeight: 1.6 }}
              data-testid={`message-body-${message.id}`}
              dangerouslySetInnerHTML={{ __html: message.bodyHtml || message.snippet }} 
            />
          </div>
        ))}
      </div>
    </article>
  );
}
