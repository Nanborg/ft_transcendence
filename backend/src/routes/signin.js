const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
router.use(express.json());
const prisma = require('../db');



// sign in route, here to create and register users

//	└──>curl -i -X POST http://localhost:3000/signin \
//		  -H "Content-Type: application/json" \
//		  -d '{"name":"MyName","password":"test","email":"MN@gmail.com"}'
//
//		HTTP/1.1 201 Created
//		-Powered-By: Express
//		ontent-Type: application/json; charset=utf-8
//		ontent-Length: 40
//		Tag: W/"28-xbAt8PKPDpOxpUzH2m3v+gC62EQ"
//		ate: Tue, 23 Jun 2026 14:41:31 GMT
//		onnection: keep-alive
//		eep-Alive: timeout=5
//
//		{"message":"Sign up success","userId":9}



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

		const user = await prisma.user.create({
			data: {
				username: req.body.name,
				email: req.body.email,
				password: hashedPassword
			}
		});
		//Loufoko
		// TODO -> return user.username instead of user.name and keep the signup response contract stable.
		// The Prisma User model exposes username, so user.name will be undefined.
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
