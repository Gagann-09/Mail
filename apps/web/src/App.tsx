import { MessageList } from './features/reading/MessageList';
import { MessageDetail } from './features/reading/MessageDetail';
import { Composer } from './features/compose/Composer';
import { useMailStore } from './store/useMailStore';

export function App() {
  const { isComposing, setComposing, searchQuery, setSearchQuery, toastMessage, undoAction, selectedConversationId } = useMailStore();

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
          <li><button style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: '3px solid var(--text-high)', fontWeight: 500 }}>Attention</button></li>
          <li><button style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Waiting</button></li>
          <li><button style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Later</button></li>
          <li><button style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>All Mail</button></li>
        </ul>
      </nav>
      
      {/* List Pane */}
      <section className="list-pane">
        <header style={{ padding: 'var(--space-4)', borderBottom: 'var(--border-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Attention</h2>
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
          <MessageList />
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
