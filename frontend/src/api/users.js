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
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to load profile");
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
		if (err.message === "Session expired")
			throw err;
		throw new Error("Unable to update profile");
	}
}
