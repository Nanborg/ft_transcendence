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
