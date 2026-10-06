import { MessageList } from './features/reading/MessageList';

export function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar Placeholder */}
      <nav style={{ width: '250px', borderRight: 'var(--border-default)', backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-4)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: 'var(--space-8)' }}>Mail</h1>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderLeft: '3px solid var(--text-high)' }}>Attention</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Waiting</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>Later</li>
          <li style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', color: 'var(--text-medium)' }}>All Mail</li>
        </ul>
      </nav>
      {/* Main Content Placeholder */}
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: 'var(--space-4)' }}>Attention</h2>
        <MessageList />
      </main>
    </div>
  );
}
