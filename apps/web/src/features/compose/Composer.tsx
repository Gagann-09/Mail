import { useState } from 'react';
import { useMailStore } from '../../store/useMailStore';

export function Composer() {
  const { setComposing, sendMessage, composeDefaults } = useMailStore();
  
  const [to, setTo] = useState(composeDefaults?.to || '');
  const [subject, setSubject] = useState(composeDefaults?.subject || '');
  const [body, setBody] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!to || !body) {
      setError('To and Body are required');
      return;
    }
    
    setError(null);
    setIsSending(true);
    
    try {
      await sendMessage(to, subject, body, isWaiting, composeDefaults?.threadId);
      setComposing(false);
    } catch (err) {
      setError('Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      data-testid="composer-modal"
      style={{
        position: 'fixed',
        bottom: 0,
        right: '50px',
        width: '500px',
        height: '600px',
        backgroundColor: 'var(--bg-primary)',
        border: 'var(--border-default)',
        borderBottom: 'none',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}
    >
      {/* Header */}
      <header 
        style={{ 
          padding: 'var(--space-3) var(--space-4)', 
          backgroundColor: 'var(--bg-secondary)', 
          borderBottom: 'var(--border-default)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}
      >
        <span style={{ fontWeight: 600 }}>New Message</span>
        <button 
          data-testid="close-composer"
          onClick={() => setComposing(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-medium)' }}
        >
          ×
        </button>
      </header>
      
      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 'var(--space-4)', gap: 'var(--space-2)' }}>
        {error && <div data-testid="composer-error" style={{ color: 'var(--status-destructive)', fontSize: '14px' }}>{error}</div>}
        
        <input 
          data-testid="composer-to"
          type="text" 
          placeholder="To" 
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ border: 'none', borderBottom: 'var(--border-default)', padding: 'var(--space-2) 0', outline: 'none' }}
        />
        <input 
          data-testid="composer-subject"
          type="text" 
          placeholder="Subject" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ border: 'none', borderBottom: 'var(--border-default)', padding: 'var(--space-2) 0', outline: 'none', fontWeight: 600 }}
        />
        <textarea 
          data-testid="composer-body"
          placeholder="Write your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ flex: 1, border: 'none', padding: 'var(--space-2) 0', outline: 'none', resize: 'none', marginTop: 'var(--space-2)' }}
        />
      </div>

      {/* Footer / Send Bar */}
      <footer style={{ padding: 'var(--space-4)', borderTop: 'var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '14px', color: 'var(--text-medium)', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isWaiting} 
            onChange={(e) => setIsWaiting(e.target.checked)} 
            data-testid="composer-waiting-toggle"
          />
          Track as Waiting
        </label>
        
        <button 
          data-testid="composer-send"
          onClick={handleSend}
          disabled={isSending}
          style={{ 
            backgroundColor: 'var(--text-high)', 
            color: 'var(--bg-primary)', 
            border: 'none', 
            padding: 'var(--space-2) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            cursor: isSending ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </footer>
    </div>
  );
}
