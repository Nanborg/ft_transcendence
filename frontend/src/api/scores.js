import { apiRequest } from "./apiReq";

export async function fetchMatchHistory(accessToken) {
	try{
		return await apiRequest(`/api/scores/history`, {});
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to load match history");
	}
}

export async function fetchLeaderBoard() {
	try{
		return await apiRequest(`/api/leaderboard`, {},);
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to load leaderboard");
	}
}
