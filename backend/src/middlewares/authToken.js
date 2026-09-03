const jwt = require("jsonwebtoken");




//	Middleware that validates a JWT access token.
//
//	Process:
//	1. Extracts the token from the Authorization header.
//	2. Verifies the token using the access token secret.
//	3. Attaches the decoded user payload to `req.user`.
//	4. Allows the request to continue if the token is valid.
//
//	param {Request} req - Express request containing the Authorization header.
//	param {Response} res - Express response object.
//	param {NextFunction} next - Express next middleware function.
//
//	throws {401} If no token is provided.
//	throws {401} If the token is expired.
//	throws {403} If the token is invalid.
//	throws {500} If an unexpected server error occurs.


function authToken(req, res, next) {
	try {
		const token = req.cookies ? req.cookies.accessToken : null;

		if (!token)
			return res.status(401).json({
				error: "Access token missing",
				code: "ACCESS_TOKEN_MISSING"
			});

		jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
			if (err)
			{
				console.error("Token verification failed:", err.message);
				if (err.name === "TokenExpiredError")
					return res.status(401).json({
						error: "Token expired",
						code: "ACCESS_TOKEN_EXPIRED"
					});
				return res.status(403).json({
					error: "Invalid token",
					code: "ACCESS_TOKEN_INVALID"
				});
			}

			req.user = user;
			next();
		});
	} catch (err) {
		console.error("Auth middleware error: ", err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = authToken;
