import { MessageList } from './features/reading/MessageList';
import { MessageDetail } from './features/reading/MessageDetail';
import { Composer } from './features/compose/Composer';
import { useMailStore } from './store/useMailStore';

export function App() {
  const { isComposing, setComposing } = useMailStore();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar Placeholder */}
      <nav style={{ width: '250px', borderRight: 'var(--border-default)', backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-4)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Mail</h1>
        
        <button 
          data-testid="compose-btn"
          onClick={() => setComposing(true)}
          style={{ width: '100%', padding: 'var(--space-3)', marginBottom: 'var(--space-6)', backgroundColor: 'var(--text-high)', color: 'var(--bg-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
        >
          Compose (C)
        </button>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: '3px solid var(--text-high)' }}>Attention</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Waiting</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Later</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>All Mail</li>
        </ul>
      </nav>
      
      {/* List Pane */}
      <section style={{ width: '400px', borderRight: 'var(--border-default)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <header style={{ padding: 'var(--space-4)', borderBottom: 'var(--border-default)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 500 }}>Attention</h2>
        </header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MessageList />
        </div>
      </section>

      {/* Detail Pane */}
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
        <MessageDetail />
      </main>

      {/* Composer Modal/Drawer */}
      {isComposing && <Composer />}
    </div>
  );
}
