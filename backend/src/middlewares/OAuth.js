const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require('../db');


// to delete and replace with data base

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '15m' })
}

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
			name: user.name
		}
		const accessToken = generateAccessToken(u)
		const refreshToken = jwt.sign(u, process.env.REFRESH_SECRET_TOKEN)
		await prisma.refreshToken.create({
			data: { token: refreshToken, userId: user.id }
		});


		res.json({ message: "Connection success", accessToken: accessToken, refreshToken: refreshToken })
	}
	catch (err) {
		console.error("Auth error: ", err);
		res.status(500).send()
	}
}

module.exports = { OAuth, generateAccessToken };
