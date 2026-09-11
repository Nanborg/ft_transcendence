import { apiRequest } from "./apiReq";

export async function fetchMatchHistory()
{
	try{
		return await apiRequest(`/api/scores/history`, {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to load match history");
	}
}

export async function fetchUserMatchHistory(userId) {
	const normalizedUserId = Number(userId);
	if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0)
		throw new Error("Invalid user id");
	try{
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
		const response = await fetch('/api/scores/leaderboard');
		if (!response.ok)
			throw new Error(`Api error: ${response.status}`);
		return response.json();
	} catch (err) {
		throw new Error("Unable to load leaderboard");
	}
}
