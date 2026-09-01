const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//		Generates a short-lived JWT access token for an authenticated user.
//
//		parammeters: user object (name and id).
//		returns: signed JWT access token valid for 15 minutes.

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '15m', algorithm: 'HS256', jwtid: crypto.randomUUID()})
}

module.exports = { generateAccessToken };
