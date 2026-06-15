const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require('../middlewares/OAuth');
require("../middlewares/OAuth");
const prisma = require('../db');

router.use(express.json());

router.post("/", async (req, res) => {
	try {
		const refreshToken = req.body && req.body.token
		if (refreshToken == null)
			return res.sendStatus(401)
	
	
			const tokenExist = prisma.refreshToken.findUnique({
				where: { token: refreshToken },
				include: { user: true } //get associated user
			});
	
			if (tokenExist == null)
				return res.status(403) // invalid or expired
	
		jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
			if (err)
				return (res.sendStatus(403))
			const accessToken = generateAccessToken({name: tokenExist.user.name});
			res.json({accessToken: accessToken})
		})
	}
	catch (err) {
		console.error("Refresh token error: ", err);
		res.status(500).json({ error: 'Server error' });
	}

});

module.exports = router;
