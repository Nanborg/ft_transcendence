const AUTH_SESSION_STORAGE_KEY = 'ft_transcendence_auth_session';
export const AUTH_SESSION_CHANGED_EVENT = 'auth:session-changed';

export function getStoredAuthSession()
{
	try {
		const storedSession = window.localStorage.getItem( AUTH_SESSION_STORAGE_KEY, );

		if (!storedSession)
			return null;

		return (JSON.parse(storedSession));
	} catch {
		window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
		return (null);
	}
}

export function storeAuthSession(session)
{
	window.localStorage.setItem( AUTH_SESSION_STORAGE_KEY, JSON.stringify(session), );
}

export function clearStoredAuthSession()
{
	window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function setAuthSession(session)
{
	storeAuthSession(session);
	window.dispatchEvent( new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: session }), );
}

export function clearAuthSession(expectedRefreshToken = null)
{
	if (expectedRefreshToken)
	{
		const currentSession = getStoredAuthSession();
		if (currentSession?.refreshToken !== expectedRefreshToken)
			return false;
	}
	clearStoredAuthSession();
	window.dispatchEvent( new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: null }), );
	return (true);
}
