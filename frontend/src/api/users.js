import { apiRequest } from "./apiReq";

export async function loginUser(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
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

export async function fetchCurrentUser(accessToken) {
	try{
		return await apiRequest("/api/users/me", {});
	} catch (err) {
		if (err.status === 401 || err.status === 403)
			throw err;
		throw new Error("Unable to load profile");
	}
}

export async function updateCurrentUser(accessToken, profileData) {

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

export async function logoutUser(refreshToken) {
	if (!refreshToken) {
		return;
	}
	await fetch('/api/logout', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token: refreshToken }),
	});
}
