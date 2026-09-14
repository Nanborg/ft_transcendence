import { apiRequest } from "./apiReq"

export async function fetchFriends()
{

	try{
		// WHY: Friends page owns display state.
		return (await apiRequest("/api/friends", {}));
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err
		throw new Error("Unable to load friends");
	}
}

export async function addFriend(friendId)
{
	try{
		// REQUIRED: Backend receives target user in URL.
		return (await apiRequest(`/api/friends/${friendId}`, {method: "POST"}));
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to add friend");
	}
}

export async function acceptFriends(friendId)
{

	try{
		// DECISION: Accept is a partial friendship update.
		return (await apiRequest(`/api/friends/${friendId}/accept`, {method: "PATCH"}));
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to accept friends");
	}
}

export async function removeFriend(friendId)
{
	try{
		// DECISION: Same endpoint removes friendship state.
		return (await apiRequest(`/api/friends/${friendId}`, {method: "DELETE",}));
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to delete friend");
	}
}
