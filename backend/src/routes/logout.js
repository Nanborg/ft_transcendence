const express = require("express");
const router = express.Router();
const prisma = require('../db');
router.use(express.json());

router.delete("/", async(req, res) => {
	try {
		const token = req.cookies ? req.cookies.refreshToken : null;
		if (!token)
			return res.sendStatus(400)
		await prisma.refreshToken.updateMany(
		{
			where: { token: token },
			data: { isRevoked: true }
		});
		res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
		return (res.sendStatus(204));
	}
	catch (err)
	{
		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
