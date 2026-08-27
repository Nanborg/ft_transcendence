export function CurrentUserCard({ currentUser, onLogout }) {
  const displayName = currentUser.username || currentUser.name || `User ${currentUser.id}`;
  return (
    <div className="current-user-card">
      <p>Connected as {displayName}</p>
      {currentUser.email && (
        <p>{currentUser.email}</p>
      )}
      <button className="btn btn-outline-warning" type="button" onClick={onLogout}>Logout</button>
    </div>
  );
}
