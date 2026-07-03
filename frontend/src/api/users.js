
export async function loginUser(name, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to login.');
  }

  return response.json();
}

export async function registerUser(name, email, password) {
  const response = await fetch('/api/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
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
  const response = await fetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = new Error(
      response.status === 401 || response.status === 403 ? 'Session expired. Login again.' : 'Unable to load profile.',
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function updateCurrentUser(accessToken, profileData) {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const error = new Error(
      response.status === 401 || response.status === 403 ? 'Session expired. Login again.' : 'Unable to update profile.',);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
