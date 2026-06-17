export function CurrentUserCard({ currentUser, onLogout }) {
  return (
    <div className="current-user-card">
      <p>Connected as {currentUser.name}</p>
      <p>{currentUser.email}</p>
      <button type="button" onClick={onLogout}> Logout</button>
    </div>
  );
}