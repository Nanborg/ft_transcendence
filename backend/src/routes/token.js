const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require('../middlewares/OAuth');
require("../middlewares/OAuth");
const prisma = require('../db');
router.use(express.json());




// token route that give you a valid token for another 15 min (can be changed)

//		└──>curl -i -X POST http://localhost:3000/token \
//		 -H "Content-Type: application/json" \
//		 -d '{"token":"yyyyyyyyyyyyyyyyyyyy"}'		#refreshToken here
//
//		HTTP/1.1 200 OK
//		X-Powered-By: Express
//		Content-Type: application/json; charset=utf-8
//		Content-Length: 159
//		ETag: W/"9f-rYKJNvOnaQvNwQ6EfvLSiizdeUA"
//		Date: Tue, 23 Jun 2026 14:50:23 GMT
//		Connection: keep-alive
//		Keep-Alive: timeout=5
//
//		{"accessToken":"XXXXXXXXXXXXXXXXXXXXX"}



router.post("/", async (req, res) => {
	try {
		const refreshToken = req.body && req.body.token
		if (refreshToken == null)
			return res.sendStatus(401)

			const tokenExist = await prisma.refreshToken.findUnique({
				where: { token: refreshToken },
				include: { user: true } //get associated user
			});

			if (tokenExist == null)
				return res.sendStatus(403); // invalid or expired
		jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
			if (err)
				return (res.sendStatus(403))
			const accessToken = generateAccessToken({id: tokenExist.user.id, username: tokenExist.user.username});
			res.json({accessToken: accessToken})
		})
	}
	catch (err) {
		console.error("Refresh token error: ", err);
		res.status(500).json({ error: 'Server error' });
	}

});

module.exports = router;
