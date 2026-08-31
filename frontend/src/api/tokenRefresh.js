import { clearAuthSession, getStoredAuthSession, setAuthSession } from '../features/auth/devUserStorage';

let refreshPromise = null;

export class ApiError extends Error {
	constructor(message, status = null, code = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

export async function apiError(response) {
	let body = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}
	return new ApiError(
		body?.error || body?.message || `Api error: ${response.status}`,
		response.status,
		body?.code || null,
	);
}

export async function refreshAccessToken(refreshToken) {
	const response = await fetch('/api/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: refreshToken }),
	});

	if (!response.ok) {
		throw await apiError(response);
	}

	const tokens = await response.json();
	if (
		typeof tokens?.accessToken !== 'string' ||
		tokens.accessToken.trim() === '' ||
		typeof tokens?.refreshToken !== 'string' ||
		tokens.refreshToken.trim() === ''
	) {
		throw new ApiError('Invalid token refresh response', 500, 'TOKEN_REFRESH_RESPONSE_INVALID');
	}

	return tokens;
}

export async function refreshAuthSession(sessionUsed) {
	const latestSession = getStoredAuthSession();

	if (!latestSession?.accessToken || !latestSession?.refreshToken) {
		throw new ApiError('No valid session', 401, 'SESSION_MISSING');
	}
	if (latestSession.accessToken !== sessionUsed.accessToken) {
		return latestSession;
	}

	if (!refreshPromise) {
		const failedRefreshToken = latestSession.refreshToken;
		refreshPromise = refreshAccessToken(failedRefreshToken)
			.then((tokens) => {
				const currentSession = getStoredAuthSession();
				const nextSession = {
					...(currentSession || latestSession),
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
				};
				setAuthSession(nextSession);
				return nextSession;
			})
			.catch((error) => {
				clearAuthSession(failedRefreshToken);
				throw error;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}
