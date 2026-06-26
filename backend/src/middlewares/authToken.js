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
//	throws {403} If the token is invalid or expired.
//	throws {500} If an unexpected server error occurs.


async function authToken(req, res, next) {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token)
			return res.sendStatus(401);

		await jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
			if (err)
				return res.sendStatus(403);

			req.user = user;
			next();
		});
	} catch (err) {
		console.error("Auth middleware error: ", err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = authToken;
