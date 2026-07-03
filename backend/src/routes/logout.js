const express = require("express");
const router = express.Router();
require("../middlewares/OAuth");
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
		if (!req.body || !req.body.token)
			return res.sendStatus(400)
		//Loufoko
		// TODO -> make logout idempotent or clearly document the expected response for already-revoked tokens.
		// Clients should be able to logout safely even if the refresh token was already deleted.
		await prisma.refreshToken.delete({
			where: { token: req.body.token }
		});

		return res.sendStatus(204)
	}
	catch (err) {
		if (err.code === 'P2025') {
			return res.status(404).json({ error: 'Token not found' });
		}

		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
