
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
  const response = await fetch('/api/users/me', {
    credentials: 'include'
  })

  if (!response.ok) {
    const error = new Error(
      response.status === 401 || response.status === 403 ? 'Session expired. Login again.' : 'Unable to load profile.',
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function updateCurrentUser(profileData) {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
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
