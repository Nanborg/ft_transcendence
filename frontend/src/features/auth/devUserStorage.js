const AUTH_SESSION_STORAGE_KEY = 'ft_transcendence_auth_session';
// SYNC: App listens to this custom event in the same tab
export const AUTH_SESSION_CHANGED_EVENT = 'auth:session-changed';

export function getStoredAuthSession()
{
	try {
		// REQUIRED: Session survives page refresh
		const storedSession = window.localStorage.getItem( AUTH_SESSION_STORAGE_KEY, );

		if (!storedSession)
			return null;

		// SAFETY: Stored JSON can be corrupted manually
		return (JSON.parse(storedSession));
	} catch {
		// SAFETY: Broken storage should not block login
		window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
		return (null);
	}
}

export function storeAuthSession(session)
{
	// SYNC: Persist user data for reload
	window.localStorage.setItem( AUTH_SESSION_STORAGE_KEY, JSON.stringify(session), );
}

export function clearStoredAuthSession()
{
	// SAFETY: Remove stale local auth state
	window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function setAuthSession(session)
{
	storeAuthSession(session);
	// SYNC: Notify App without waiting for storage event
	window.dispatchEvent( new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: session }), );
}

export function clearAuthSession(expectedRefreshToken = null)
{
	if (expectedRefreshToken)
	{
		// SAFETY: Do not clear a newer session
		const currentSession = getStoredAuthSession();
		if (currentSession?.refreshToken !== expectedRefreshToken)
			return false;
	}
	clearStoredAuthSession();
	// SYNC: Null detail means logged out
	window.dispatchEvent( new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: null }), );
	return (true);
}
