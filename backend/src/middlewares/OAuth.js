const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// REQUIRED: Create short-lived access token.
function generateAccessToken(user)
{
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '15m', algorithm: 'HS256', jwtid: crypto.randomUUID()})
}

module.exports = { generateAccessToken };
