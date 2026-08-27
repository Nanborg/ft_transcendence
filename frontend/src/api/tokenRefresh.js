export async function refreshAccessToken(refreshToken)
{
	const response = await fetch('/api/token',
		{
			method: 'POST',
			headers: {'Content-Type': 'application/json',},
			body: JSON.stringify({token: refreshToken,}),
		});

	if (!response.ok)
		throw new Error('Token refresh failed');

	return response.json(); // accessToken, refreshToken;
}
