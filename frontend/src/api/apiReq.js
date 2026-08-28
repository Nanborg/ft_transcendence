import { ApiError, apiError, refreshAuthSession } from "./tokenRefresh";
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, getStoredAuthSession } from '../features/auth/devUserStorage';

let sessionExpiredHandled = false; //test-nico

if (typeof window !== 'undefined') { //test-nico
	window.addEventListener(AUTH_SESSION_CHANGED_EVENT, (event) => {
		if (event.detail) {
			sessionExpiredHandled = false;
		}
	});
}

function expireSession(onSessionExpired, error, refreshToken = null) { //test-nico
	if (sessionExpiredHandled) {
		return;
	}
	sessionExpiredHandled = true;
	if (clearAuthSession(refreshToken) && onSessionExpired) {
		onSessionExpired(error.message || "Session expired. Login again.");
	}
}

function fetchWithSession(endpoint, opt, session) { //test-nico
	return fetch(endpoint, {
		...opt,
		headers: {
			...(opt.headers || {}),
			Authorization: `Bearer ${session.accessToken}`,
		},
	});
}

export async function apiRequest(endpoint, opt = {}, onSessionExpired = null) { //test-nico
	const session = getStoredAuthSession();

	if (!session)
		throw new ApiError("No valid session", 401, "SESSION_MISSING");

	let response = await fetchWithSession(endpoint, opt, session);

	if (response.status === 403 || response.status === 401) {
		const error = await apiError(response);
		if (response.status === 403 || error.code !== "ACCESS_TOKEN_EXPIRED") {
			expireSession(onSessionExpired, error);
			throw error;
		}
		try {
			response = await fetchWithSession(
				endpoint,
				opt,
				await refreshAuthSession(session),
			);
		} catch (refreshError) {
			const latestSession = getStoredAuthSession();
			if (!latestSession?.accessToken || latestSession.refreshToken === session.refreshToken) {
				expireSession(onSessionExpired, refreshError, session.refreshToken);
				throw refreshError;
			}
			response = await fetchWithSession(endpoint, opt, latestSession);
		}
	}

	if (response.status === 401 || response.status === 403) {
		const error = await apiError(response);
		expireSession(onSessionExpired, error);
		throw error;
	}

	if (!response.ok) {
		throw await apiError(response);
	}

	return (response.json());
}
