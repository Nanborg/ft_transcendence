// WHY: Current user card keeps login identity visible beside developer actions
// FALLBACK: Account display uses the best available identity field
export function CurrentUserCard({ currentUser, onLogout })
{
	// FALLBACK: Display id when name is missing
	const displayName = currentUser.username || currentUser.name || `User ${currentUser.id}`;
	return (
		<div className="current-user-card">
			<p>Connected as {displayName}</p>
			{currentUser.email && (<p>{currentUser.email}</p>)}
			<button className="btn btn-outline-warning" type="button" onClick={onLogout}>Logout</button>
		</div>
	);
}
