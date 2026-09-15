import { apiRequest } from "./apiReq";

export async function fetchMatchHistory()
{
	try{
		// REQUIRED: Own history uses auth cookie
		return await apiRequest(`/api/scores/history`, {});
	} catch (err) {
		// SAFETY: Auth errors must bubble to App
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to load match history");
	}
}

export async function fetchUserMatchHistory(userId) {
	const normalizedUserId = Number(userId);
	// SAFETY: Public history id must be valid
	if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0)
		throw new Error("Invalid user id");
	try{
		// REQUIRED: Route id selects visited profile
		return await apiRequest(`/api/scores/history/${normalizedUserId}`, {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		if (err.status === 404)
			throw new Error("User match history not found");
		throw new Error("Unable to load match history");
	}
}

export async function fetchLeaderBoard() {
	try{
		// DECISION: Leaderboard is public
		const response = await fetch('/api/scores/leaderboard');
		if (!response.ok)
			throw new Error(`Api error: ${response.status}`);
		return response.json();
	} catch (err) {
		throw new Error("Unable to load leaderboard");
	}
}
