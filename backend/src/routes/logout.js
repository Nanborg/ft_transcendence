const express = require("express");
const router = express.Router();
const prisma = require('../db');
router.use(express.json());







// to logout (need to verify how to log out instantly and not just delete the refresh token)

//		└──>curl -i -X DELETE http://localhost:3000/logout \
//		 -H "Content-Type: application/json" \
//		 -d '{"token":"yyyyyyyyyyyyyyyyyyyyy"}' #refreshToken
//
//		HTTP/1.1 204 No Content
//		-Powered-By: Express
//		Tag: W/"a-bAsFyilMr4Ra1hIU5PyoyFRunpI"
//		ate: Tue, 23 Jun 2026 14:59:58 GMT
//		onnection: keep-alive
//		eep-Alive: timeout=5


router.delete("/", async(req, res) => {
	try {
		const token = req.cookies ? req.cookies.refreshToken : null;
		if (!token)
			return res.sendStatus(400)
		await prisma.refreshToken.updateMany({
			where: {
				token: token
			},
			data: {
				isRevoked: true
			}
		});
		res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
		return res.sendStatus(204)
	}
	catch (err) {
		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
