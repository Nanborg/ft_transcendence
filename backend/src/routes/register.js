const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
router.use(express.json());
const prisma = require('../db');
const { cleanInput } = require('../services/sanitize');


router.post ("/", async (req, res) =>
{
	try {
			if (!req.body || !req.body.username || !req.body.password || !req.body.email)
				return res.status(400).json({ error: 'Missing required fields' });
			if (typeof req.body.username !== 'string' || typeof req.body.email !== 'string')
				return res.status(400).json({ error: 'Invalid required fields' });
			const cleanName = cleanInput(req.body.username.trim());
			const cleanEmail = cleanInput(req.body.email.trim());
			if (cleanName === '')
				return res.status(400).json({ error: 'userName is empty' });
			if (cleanEmail === '')
				return res.status(400).json({ error: 'email is empty' });
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
				return res.status(400).json({ error: 'invalid email' });
			const existingUser = await prisma.user.findUnique({
				where: { username: cleanName }
			});
			if (existingUser)
				return res.status(400).send('Username is already taken') // need to be set to 409 Conflict

		const hashedPassword = await bcrypt.hash(req.body.password, 10)

		const user = await prisma.user.create(
		{
			data:
			{
				username: cleanName,
				email: cleanEmail,
				password: hashedPassword
			}
		});
		res.status(201).json(
		{
			message: 'Register success',
			userId: user.id,
			username: user.username
		});

	} catch (err){
		if (err.code === 'P2002')
			return res.status(400).json({ error: 'Email or username already exists' });

		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
