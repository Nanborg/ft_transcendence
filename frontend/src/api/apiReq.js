import { refreshAccessToken } from "./tokenRefresh";
import { clearStoredAuthSession } from '../features/auth/devUserStorage';

//call refreshAccessToken if the access token is no more valid(401/403)
//send an error or store new tokens if valids and then do their action if store

export async function apiRequest(endpoint, opt = {}, onSessionExpired = null)
{

	const fetchOptions = {
        ...opt,
        credentials: 'include'
    };

	let response = await fetch(endpoint, fetchOptions)
	if (response.status === 401)
	{
		try {
			await refreshAccessToken();
			response = await fetch(endpoint, fetchOptions)
			if (response.status === 401)
				throw new Error("Session expired");
		} catch (err) {
			clearStoredAuthSession()
			if (onSessionExpired)
				onSessionExpired("Session expired. Login again.");
			const error = new Error("Session expired");
			error.status = 401;
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
