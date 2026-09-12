import { apiRequest } from "./apiReq"

export async function fetchFriends() {

	try{
		return await apiRequest("/api/friends", {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err
		throw new Error("Unable to load friends");
	}
}

export async function addFriend(friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "POST"});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to add friend");
	}
}

export async function acceptFriends(friendId) {

	try{
		return await apiRequest(`/api/friends/${friendId}/accept`, {method: "PATCH"});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to accept friends");
	}
}

export async function removeFriend(friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "DELETE",});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to delete friend");
	}
}
