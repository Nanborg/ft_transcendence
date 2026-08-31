import { apiRequest } from "./apiReq";

export async function fetchMatchHistory(accessToken) {
	try{
		return await apiRequest(`/api/scores/history`, {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
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
