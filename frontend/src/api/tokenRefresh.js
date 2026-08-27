import { apiRequest } from "./apiReq";

export async function refreshAccessToken(refreshToken)
{
	try{
		return await apiRequest(`/api/token`,
			{
				method: "POST",
				headers: {'Content-type': 'application/json'},
				body: JSON.stringify({token: refreshToken}),
			}); // return new accessToken and new refreshToken
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Token refresh failed");
	}
}
