const express = require("express");
const router = express.Router();
require("../middlewares/OAuth");
const prisma = require('../db');

router.use(express.json());

router.delete("/", async(req, res) => {
	try {
		if (!req.body || !req.body.token)
			return res.sendStatus(400)

		await prisma.refreshToken.delete({
			where: { token: req.body.token }
		});

		return res.sendStatus(204)
	}
	catch {
		if (err.code === 'P2025') {
			return res.status(404).json({ error: 'Token not found' });
		}

		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
