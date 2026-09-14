const jwt = require("jsonwebtoken");

function socketAuth(socket, next)
{
	// REQUIRED: Socket.IO auth uses cookies from handshake.
	const cookieHeader = socket.handshake.headers.cookie;

	if (!cookieHeader)
	{
		// SYNC: Frontend refreshes on missing token.
		const authError = new Error("Auth token missing");
		authError.data = { code: "ACCESS_TOKEN_MISSING" };
		return next(authError);
	}

	const cookies = cookieHeader.split(';')
		.reduce((res, item) =>
		{
			// DECISION: Minimal cookie parser for handshake.
			const data = item.trim().split('=');
			return { ...res, [data[0]]: data[1] };
		}, {});

	const token = cookies.accessToken;

	if (!token)
	{
		// SAFETY: No token means no socket access.
		const authError = new Error("Auth token missing");
		authError.data = { code: "ACCESS_TOKEN_MISSING" };
		return next(authError);
	}

	try {
		// REQUIRED: Socket handlers read socket.user.
		const user = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
		socket.user = user;
		next();
	} catch (error) {
		// SYNC: Error codes match HTTP auth flow.
		const authError = new Error(error.name === "TokenExpiredError" ? "Token expired" : "Invalid auth token");
		authError.data = { code: error.name === "TokenExpiredError" ? "ACCESS_TOKEN_EXPIRED" : "ACCESS_TOKEN_INVALID" };
		next(authError);
	}
}

module.exports = socketAuth;
