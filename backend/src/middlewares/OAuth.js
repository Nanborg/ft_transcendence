const jwt = require("jsonwebtoken");

//		Generates a short-lived JWT access token for an authenticated user.
//
//		parammeters: user object (name and id).
//		returns: signed JWT access token valid for 15 minutes.

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '15m' })
}

module.exports = { generateAccessToken };
