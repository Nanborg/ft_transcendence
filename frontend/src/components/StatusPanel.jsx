export function StatusPanel({ socketStatus, currentUser }) {
  const displayName = currentUser ? currentUser.username || currentUser.name || `User ${currentUser.id}` : 'not logged in';
  return (
    <aside className="status-panel" aria-label="Connection status">
      <h2>System status</h2>
      <p>Socket.IO: {socketStatus}</p>
      <p>Session: {displayName}</p>
    </aside>
  );
}