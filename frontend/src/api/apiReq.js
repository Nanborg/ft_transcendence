import { refreshAccessToken } from "./tokenRefresh";
import { clearStoredAuthSession, getStoredAuthSession, storeAuthSession, } from '../features/auth/devUserStorage';

//call refreshAccessToken if the access token is no more valid(401/403)
//send an error or store new tokens if valids and then do their action if store

export async function apiRequest(endpoint, opt, onSessionExpired = null)
{

	let session = getStoredAuthSession();

	if (!session)
		throw new Error("No valid session")

	const headers = {...opt.headers, Authorization: `Bearer ${session.accessToken}`,}
	let response = await fetch(endpoint, {...opt, headers})
	if (response.status === 401) //test-nico
	{
		try {
			const newTokens = await refreshAccessToken(session.refreshToken);
			const updatedSession = {...session, accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken};
			storeAuthSession(updatedSession);
			window.dispatchEvent(new CustomEvent('auth:session-refreshed', { detail: updatedSession })); //test-nico

			const newHeaders = {...opt.headers, Authorization: `Bearer ${newTokens.accessToken}`,}
			response = await fetch(endpoint, {...opt, headers: newHeaders})
			if (response.status === 401) //test-nico
			{
				if (onSessionExpired)
					onSessionExpired("Session expired. Login again.");
				const error = new Error("Session expired"); //test-nico
				error.status = 401; //test-nico
				throw error;
			}
		} catch (err) {
			clearStoredAuthSession()
			if (onSessionExpired)
				onSessionExpired("Session expired. Login again.");
			const error = new Error("Session expired"); //test-nico
			error.status = 401; //test-nico
			throw error;
		}
	}
	if (!response.ok)
	{
		const err = new Error(`Api error: ${response.status}`);
		err.status = response.status;
		throw err;
	}

	return (response.json());
}
