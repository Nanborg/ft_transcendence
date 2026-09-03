import { apiError, refreshAccessToken } from "./tokenRefresh";
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession } from '../features/auth/devUserStorage';

let sessionExpiredHandled = false;

if (typeof window !== 'undefined') {
	window.addEventListener(AUTH_SESSION_CHANGED_EVENT, (event) => {
		if (event.detail) {
			sessionExpiredHandled = false;
		}
	});
}

function expireSession(onSessionExpired, error) {
	if (sessionExpiredHandled) {
		return;
	}
	sessionExpiredHandled = true;
	if (clearAuthSession() && onSessionExpired) {
		onSessionExpired(error.message || "Session expired. Login again.");
	}
}

function fetchWithSession(endpoint, opt) {
	return fetch(endpoint, {
		...opt,
		credentials: 'include',
	});
}

export async function apiRequest(endpoint, opt = {}, onSessionExpired = null) {
	let response = await fetchWithSession(endpoint, opt);

	if (response.status === 401) {
		const error = await apiError(response);
		if (error.code !== "ACCESS_TOKEN_EXPIRED" && error.code !== "ACCESS_TOKEN_MISSING")
		{
			expireSession(onSessionExpired, error);
			throw error;
		}
		try {
			await refreshAccessToken();
			response = await fetchWithSession(endpoint, opt);
		} catch (refreshError) {
			expireSession(onSessionExpired, refreshError);
			throw refreshError;
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

	return response.json();
}
