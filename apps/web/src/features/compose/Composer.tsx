import { useState, useEffect } from 'react';
import { useMailStore } from '../../store/useMailStore';

export function Composer() {
  const { setComposing, sendMessage, composeDefaults, drafts, saveDraft, clearDraft } = useMailStore();
  
  const draftKey = composeDefaults?.threadId || 'new';
  const existingDraft = drafts[draftKey];
  
  const [to, setTo] = useState(existingDraft?.to ?? composeDefaults?.to ?? '');
  const [subject, setSubject] = useState(existingDraft?.subject ?? composeDefaults?.subject ?? '');
  const [body, setBody] = useState(existingDraft?.body ?? '');
  const [isWaiting, setIsWaiting] = useState(existingDraft?.isWaiting ?? false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save draft on change
  useEffect(() => {
    saveDraft(draftKey, {
      to,
      subject,
      body,
      isWaiting,
      threadId: composeDefaults?.threadId
    });
  }, [to, subject, body, isWaiting, draftKey, saveDraft, composeDefaults?.threadId]);

  const handleSend = async () => {
    if (!to || !body) {
      setError('To and Body are required');
      return;
    }
    
    setError(null);
    setIsSending(true);
    
    try {
      await sendMessage(to, subject, body, isWaiting, composeDefaults?.threadId);
      clearDraft(draftKey);
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
      className="composer-modal"
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
          aria-label="Close composer"
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
          aria-label="Recipient"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ border: 'none', borderBottom: 'var(--border-default)', padding: 'var(--space-2) 0', outline: 'none' }}
        />
        <input 
          data-testid="composer-subject"
          type="text" 
          placeholder="Subject" 
          aria-label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ border: 'none', borderBottom: 'var(--border-default)', padding: 'var(--space-2) 0', outline: 'none', fontWeight: 600 }}
        />
        <textarea 
          data-testid="composer-body"
          placeholder="Write your message..."
          aria-label="Message body"
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
