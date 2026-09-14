export class ApiError extends Error
{
	constructor(message, status = null, code = null)
	{
		// WHY: API callers need status and app code.
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

let refreshPromise = null;

export async function apiError(response)
{
	let body = null;
	try {
		// FALLBACK: Error body may be empty.
		body = await response.json();
	} catch {
		body = null;
	}
	return new ApiError(
		body?.error || body?.message || `Api error: ${response.status}`,
		response.status,
		body?.code || null,
	);
}

export async function refreshAccessToken()
{
	if (!refreshPromise)
	{
		// SAFETY: Share one refresh request at a time.
		refreshPromise = fetch('/api/token', { method: 'POST', credentials: 'include', })
			.then(async (response) =>
			{
				if (!response.ok)
					// SYNC: Preserve backend refresh error.
					throw await apiError(response);
				return response.json();
			})
			.finally(() =>
			{
				// SYNC: Future expiry can refresh again.
				refreshPromise = null;
			});
	}

	return (refreshPromise);
}
