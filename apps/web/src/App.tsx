import { MessageList } from './features/reading/MessageList';
import { AttachmentList } from './features/reading/AttachmentList';
import { MessageDetail } from './features/reading/MessageDetail';
import { Composer } from './features/compose/Composer';
import { useMailStore } from './store/useMailStore';

export function App() {
  const { isComposing, setComposing, searchQuery, setSearchQuery, toastMessage, undoAction, selectedConversationId, currentView, setCurrentView } = useMailStore();

  return (
    <div className="app-container" data-view={selectedConversationId ? 'detail' : 'list'}>
      {/* Sidebar Placeholder */}
      <nav className="nav-pane">
        <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Mail</h1>
        
        <button 
          data-testid="compose-btn"
          onClick={() => setComposing(true)}
          style={{ width: '100%', padding: 'var(--space-3)', marginBottom: 'var(--space-6)', backgroundColor: 'var(--text-high)', color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
        >
          Compose (C)
        </button>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <li>
            <button 
              onClick={() => setCurrentView('attention')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: currentView === 'attention' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'attention' ? 600 : 500, color: currentView === 'attention' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Attention
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentView('waiting')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: currentView === 'waiting' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'waiting' ? 600 : 500, color: currentView === 'waiting' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Waiting
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentView('later')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: currentView === 'later' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'later' ? 600 : 500, color: currentView === 'later' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Later
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentView('all')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: currentView === 'all' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'all' ? 600 : 500, color: currentView === 'all' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              All Mail
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentView('attachments')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: currentView === 'attachments' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'attachments' ? 600 : 500, color: currentView === 'attachments' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Attachments
            </button>
          </li>
        </ul>

        <div style={{ padding: 'var(--space-4)', paddingBottom: 'var(--space-2)', fontSize: '12px', fontWeight: 600, color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Smart Views
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <button 
              onClick={() => setCurrentView('newsletters')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer', borderLeft: currentView === 'newsletters' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'newsletters' ? 600 : 500, color: currentView === 'newsletters' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Newsletters
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentView('notifications')}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-4)', cursor: 'pointer', borderLeft: currentView === 'notifications' ? '3px solid var(--text-high)' : '3px solid transparent', fontWeight: currentView === 'notifications' ? 600 : 500, color: currentView === 'notifications' ? 'var(--text-high)' : 'var(--text-medium)' }}
            >
              Notifications
            </button>
          </li>
        </ul>
      </nav>
      
      {/* List Pane */}
      <section className="list-pane">
        <header style={{ padding: 'var(--space-4)', borderBottom: 'var(--border-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500, textTransform: 'capitalize' }}>{currentView === 'all' ? 'All Mail' : currentView}</h2>
          <input 
            data-testid="search-input"
            type="text" 
            placeholder="Search Mail..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search Mail"
            style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)', outline: 'none', backgroundColor: 'var(--bg-primary)' }}
          />
        </header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {currentView === 'attachments' ? <AttachmentList /> : <MessageList />}
        </div>
      </section>

      {/* Detail Pane */}
      <main className="detail-pane">
        <MessageDetail />
      </main>

      {/* Composer Modal/Drawer */}
      {isComposing && <Composer />}

      {/* Undo Toast */}
      {toastMessage && (
        <div 
          data-testid="undo-toast"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: 'var(--space-6)',
            backgroundColor: 'var(--text-high)',
            color: 'var(--bg-primary)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          <span style={{ fontWeight: 500 }}>{toastMessage}</span>
          {undoAction && (
            <button
              data-testid="undo-btn"
              onClick={undoAction}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--bg-primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
                padding: 0
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
