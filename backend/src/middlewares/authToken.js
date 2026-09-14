const jwt = require("jsonwebtoken");

// REQUIRED: Protect private API routes.
//
// Flow:
//   1. Read access token from cookies.
//   2. Verify JWT signature and expiry.
//   3. Attach decoded payload to req.user.
//   4. Continue route handling.
function authToken(req, res, next)
{
	try {
		// REQUIRED: Browser sends token as httpOnly cookie.
		const token = req.cookies ? req.cookies.accessToken : null;

		if (!token)
			return (res.status(401).json({ error: "Access token missing", code: "ACCESS_TOKEN_MISSING"}));

		jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) =>
		{
			if (err)
			{
				console.error("Token verification failed:", err.message);
				// SYNC: Frontend can refresh only expired tokens.
				if (err.name === "TokenExpiredError")
					return res.status(401).json({ error: "Token expired", code: "ACCESS_TOKEN_EXPIRED" });
				// SAFETY: Invalid tokens must force logout.
				return (res.status(403).json({ error: "Invalid token", code: "ACCESS_TOKEN_INVALID" }));
			}

			// SYNC: Routes read authenticated user from req.user.
			req.user = user;
			next();
		});
	} catch (err) {
		console.error("Auth middleware error: ", err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = authToken;
