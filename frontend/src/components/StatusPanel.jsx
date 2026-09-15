// WHY: Status panel gives quick debug context for socket state and active session
// FALLBACK: Missing user data is displayed as a stable unauthenticated state
export function StatusPanel({ socketStatus, currentUser })
{
	// FALLBACK: Anonymous session gets stable label
	const displayName = currentUser ? currentUser.username || currentUser.name || `User ${currentUser.id}` : 'not logged in';
	return (
		<aside className="status-panel" aria-label="Connection status">
			<h2>System status</h2>
			<p>Socket.IO: <span className="badge text-bg-info">{socketStatus}</span></p>
			<p>Session: <span className="badge text-bg-secondary">{displayName}</span></p>
		</aside>
	);
}
