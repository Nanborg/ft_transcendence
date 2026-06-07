const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// to delete and replace with data base
const users = [{"name":"Mee", "password":"$2b$10$hOp9KiGy.aWwqNNemmzpROAjPUsabTFD018PMMvUBKrBTcz8LV7IK"}]


async function authToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (!token)
		return res.sendStatus(401)

	jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
		if (err)
			return res.sendStatus(403) // no longer valid token
		req.user = user
		next()
	})
}


module.exports = authToken;
