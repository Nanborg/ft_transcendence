const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const prisma = require('../db');
router.use(express.json());
const crypto = require('crypto');
const { generateAccessToken } = require('../middlewares/OAuth');




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
		const refreshToken = req.cookies ? req.cookies.refreshToken : null;
		if (refreshToken == null)
			return res.sendStatus(401)

		const tokenExist = await prisma.refreshToken.findUnique({
			where: { token: refreshToken },
			include: { user: true } //get associated user
		});
		if (!tokenExist)
			return res.status(403).json({error: "Invalid refresh token"});

		const curDate = new Date()
		if (curDate > tokenExist.expiresAt)
			return res.status(403).json({error: "Refresh token expired"});
		if (tokenExist.isRevoked === true)
			return res.status(403).json({ error: "Refresh token revoked" })
		try {
			const user = await new Promise ((resolve, reject) => {
			jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, decoded) => {
				if (err)
					return reject(err);
				resolve(decoded);
				});
			});

			await prisma.refreshToken.update ({
				where: { id: tokenExist.id },
				data: { isRevoked: true }
			})
			const userPayload = {
	    		id: user.id,
	    		username: user.username
			};
			const newAccessToken = generateAccessToken(userPayload)
			const newRefreshToken = jwt.sign(userPayload, process.env.REFRESH_SECRET_TOKEN, { expiresIn: '7d', algorithm: 'HS256', jwtid: crypto.randomUUID(), })
			const expiresAt = new Date()
			expiresAt.setDate(expiresAt.getDate() + 7)
			await prisma.refreshToken.create({
				data: { token: newRefreshToken, userId: userPayload.id, expiresAt: expiresAt }
			});
			res.cookie('accessToken', newAccessToken, {
            	httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
            });
			res.json({ message: "Token refreshed successfully" });
		}
		catch (err) {
        	console.error("Token validation error:", err);
            res.status(403).json({ error: 'Invalid refresh token' });
        }
	}
	catch (err) {
		console.error("Refresh token error: ", err);
		res.status(500).json({ error: 'Server error' });
	}

});

module.exports = router;
