export function StatusPanel({ socketStatus, currentUser }) {
  const displayName = currentUser ? currentUser.username || currentUser.name || `User ${currentUser.id}` : 'not logged in';
  return (
    <aside className="status-panel" aria-label="Connection status">
      <h2>System status</h2>
      <p>Socket.IO: <span className="badge text-bg-info">{socketStatus}</span></p>
      <p>Session: <span className="badge text-bg-secondary">{displayName}</span></p>
    </aside>
  );
}
