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

			//Loufoko
			// TODO -> await this refresh token lookup and handle the missing-token case before jwt.verify.
			// Without await, tokenExist is a Promise and tokenExist.user will not contain the Prisma user.
			const tokenExist = await prisma.refreshToken.findUnique({
				where: { token: refreshToken },
				include: { user: true } //get associated user
			});

			if (tokenExist == null)
				return res.status(403) // invalid or expired
			const curDate = new Date()
			if (curDate > tokenExist.expiresAt)
				return res.status(403).json({ error: "Token expired" })
			if (tokenExist.isRevoked === true)
				return res.status(403).json({ error: "Token revoked" })
	//Loufoko
	// TODO -> regenerate the access token with the stable auth payload: id and username.
	// Do not use tokenExist.user.name because the Prisma user model exposes username.
			jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, async (err, user) => {
			if (err)
				return (res.sendStatus(403))
			await prisma.refreshToken.update({
				where: { id: tokenExist.id },
				data: { isRevoked: true }
			})
			const userPayload = {
    			id: user.id,
    			username: user.username
			};
			const newAccessToken = generateAccessToken(userPayload)
			const newRefreshToken = jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN)
			const expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + 7)
			await prisma.refreshToken.create({
				data: { token: newRefreshToken, userId: userPayload.id, expiresAt: expiresAt }
			});
			res.json({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken
			})
		})
	}
	catch (err) {
		console.error("Refresh token error: ", err);
		res.status(500).json({ error: 'Server error' });
	}

});

module.exports = router;
