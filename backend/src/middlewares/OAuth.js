const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require('../db');



//		Generates a short-lived JWT access token for an authenticated user.
//
//		parammeters: user object (name and id).
//		returns: signed JWT access token valid for 15 minutes.

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '15m' })
}




//		Authenticates a user using username and password.
//
//	Process:
//	1. Validates that credentials are provided.
//	2. Retrieves the user from the database.
//	3. Verifies the password using bcrypt.
//	4. Generates an access token (15 min) and a refresh token.
//	5. Stores the refresh token in the database.
//	6. Returns both tokens to the client.
//
//	param {Request} req - Express request containing `name` and `password` in the body.
//	param {Response} res - Express response object.
//	param {NextFunction} next - Express next middleware function.
//
//	throws {400} If username or password is missing.
//	throws {401} If credentials are invalid.
//	throws {500} If an unexpected server error occurs.

async function OAuth(req, res, next) {
	console.log("OAuth hit");
	try {
		if (!req.body.name || !req.body.password)
			return res.status(400).json({ error: "Missing username or password" });

		const user = await prisma.user.findUnique({
			where: { username: req.body.name }
		});
		if (user == null)
			return res.status(401).send('Invalid credentials');

		if (!await bcrypt.compare(req.body.password, user.password))
			return res.status(401).json({ error: "Invalid credentials" });

		const u = {
			id: user.id,
			username: user.username
		}
		const accessToken = generateAccessToken(u)
		const refreshToken = jwt.sign(u, process.env.REFRESH_SECRET_TOKEN)
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 7)
		await prisma.refreshToken.create({
			data: { token: refreshToken, userId: user.id, expiresAt: expiresAt }
		});


		res.json({ message: "Connection success", accessToken: accessToken, refreshToken: refreshToken })
	}
	catch (err) {
		console.error("Auth error: ", err);
		res.status(500).send()
	}
}

module.exports = { OAuth, generateAccessToken };
