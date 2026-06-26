/*
export async function fetchCurrentUser(devUserName) {
  const response = await fetch('/api/users/me', {
    headers: {
      'x-dev-user': devUserName,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load profile.');
  }

  return response.json();
}
*/

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