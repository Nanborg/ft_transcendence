import { apiRequest } from "./apiReq";

export async function loginUser(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to login.');
  }

  return response.json();
}

export async function registerUser(username, email, password) {
  const response = await fetch('/api/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to create account.');
  }

  return response.json();
}

export async function fetchCurrentUser() {
	try{
		return await apiRequest("/api/users/me", {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to load profile");
	}
}

export async function fetchPublicUserProfile(userId) {
  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0)
    throw new Error("Invalid user id");
  try {
    return await apiRequest(`/api/users/${normalizedUserId}`,{});
  } catch (error) {
      if (error.status === 401 || error.status === 403)
        throw error;
      if (error.status === 404)
        throw new Error("User profile not found");
      throw new Error("Unable to load user profile");
    }
}

export async function updateCurrentUser(profileData) {
	try{
		return await apiRequest("/api/users/me",
			{
				method: "PATCH",
				headers: {'Content-type': 'application/json',},
				body: JSON.stringify(profileData),
			});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to update profile");
	}
}

export async function logoutUser() {
	await fetch('/api/logout', {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
