import { apiRequest } from "./apiReq";

export async function fetchFriends(accessToken) {

	try{
		return await apiRequest("/api/friends", {}); //test-nico
	} catch (err) {
		if (err.status === 401 || err.status === 403) //test-nico
			throw err;
		throw new Error("Unable to load friends");
	}
}

export async function addFriend(accessToken, friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "POST"});
	} catch (err) {
		if (err.status === 401 || err.status === 403) //test-nico
			throw err;
		throw new Error("Unable to add friend");
	}
}

export async function removeFriend(accessToken, friendId) {
	try{
		return await apiRequest(`/api/friends/${friendId}`, {method: "DELETE",});
	} catch (err) {
		if (err.status === 401 || err.status === 403) //test-nico
			throw err;
		throw new Error("Unable to delete friend");
	}
}
