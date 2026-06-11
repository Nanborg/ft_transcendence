const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
router.use(express.json());
const prisma = require('../db');

const users = []
router.post ("/", async (req, res) => {
	try {
		{
			const user = await prisma.user.findUnique({
				where: { username: req.body.name }
			});
			if (user)
				return res.status(400).send('Username is already taken')//check real codes
		}

		if (!req.body || !req.body.name || !req.body.password || !req.body.email)
			return res.status(400).json({ error: 'Missing required fields' });

		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		console.log(hashedPassword)

		const user = await prisma.user.create({
			data: {
				username: req.body.name,
				email: req.body.email,
				password: hashedPassword
			}
		});

		res.status(201).json({
			message: 'Sign up success',
			userId: user.id,
			username: user.name
		});

	}
	catch (err){
		if (err.code === 'P2002') {
			return res.status(400).json({ error: 'Email or username already exists' });
		}

		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
