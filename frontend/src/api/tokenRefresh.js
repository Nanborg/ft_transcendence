export class ApiError extends Error {
	constructor(message, status = null, code = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
	}
}

export async function apiError(response) {
	let body = null;
	try {
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

export async function refreshAccessToken() {
	const response = await fetch('/api/token', {
		method: 'POST',
		credentials: 'include',
	});

	if (!response.ok) {
		throw await apiError(response);
	}

	return response.json();
}
