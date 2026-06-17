export function StatusPanel({ socketStatus, currentUser }) {
  return (
    <aside className="status-panel" aria-label="Connection status">
      <h2>System status</h2>
      <p>Socket.IO: {socketStatus}</p>
      <p>Session: {currentUser ? currentUser.name : 'not logged in'}</p>
    </aside>
  );
}