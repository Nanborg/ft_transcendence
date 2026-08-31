import { apiRequest } from "./apiReq";

export async function fetchFriends(accessToken) {

	try{
		return await apiRequest("/api/friends", {}, console.log);
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to load friends");
	}
}

export async function addFriend(accessToken, friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "POST"});
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to add friend");
	}
}

export async function removeFriend(accessToken, friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "DELETE",});
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to delete friend");
	}
}

export async function acceptFriends(accessToken, friendId) {

	try{
		return await apiRequest(`/api/friends/${friendId}/accept`, {method: "PATCH"});
	} catch (err) {
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to load friends");
	}
}
