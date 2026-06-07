const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// to delete and replace with data base
const users = [{"name":"Mee", "password":"$2b$10$hOp9KiGy.aWwqNNemmzpROAjPUsabTFD018PMMvUBKrBTcz8LV7IK"}]
const refreshTokenList = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWVlIiwiaWF0IjoxNzgwODM5Mzc0fQ.guZ_YkuBofMR2H4sotLRJpcrmIcb62uXNcu0ci6x72Y"]

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn: '15m'})
}

async function OAuth(req, res, next){
	console.log("OAuth hit");
	try {
		 if (!req.body.name || !req.body.password)
			return res.status(400).json({ error: "Missing username or password" });

		const user = users.find(user => user.name === req.body.name)
		if (user == null)
			return res.status(401).send('Invalid credentials');

		if (!await bcrypt.compare(req.body.password, user.password))
			return res.status(401).json({ error: "Invalid credentials" });

		const u = {name: user.name}
		const accessToken = generateAccessToken(u)
		const refreshToken = jwt.sign(u, process.env.REFRESH_SECRET_TOKEN)
		refreshTokenList.push(refreshToken)
		res.json({message: "Connection success", accessToken:accessToken, refreshToken:refreshToken})
	}
	catch (err) {
		console.error("Auth error: ", err);
		res.status(500).send()
	}
}

module.exports = {OAuth, generateAccessToken};
