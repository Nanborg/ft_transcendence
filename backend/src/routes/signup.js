const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
router.use(express.json());
const prisma = require('../db');

router.post ("/", async (req, res) => {
	try {
			if (!req.body || !req.body.username || !req.body.password || !req.body.email)
				return res.status(400).json({ error: 'Missing required fields' });

			const cleanName = req.body.username.trim()
			if (cleanName === '')
				return res.status(400).json({ error: 'Username cannot be empty or just spaces' });

			const existingUser = await prisma.user.findUnique({
				where: { username: cleanName }
			});
			if (existingUser)
				return res.status(400).send('Username is already taken')//check real code

			const hashedPassword = await bcrypt.hash(req.body.password, 10)

			const user = await prisma.user.create({
				data: {
					username: cleanName,
					email: req.body.email,
					password: hashedPassword
				}
			});

			res.status(201).json({
				message: 'Sign up success',
				userId: user.id,
				username: user.username
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
