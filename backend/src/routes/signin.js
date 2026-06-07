const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
router.use(express.json());

const users = []
router.post ("/", async (req, res) => {
	try {
		{
			const user = users.find(user => user.name === req.body.name)
			if (user)
				return res.status(400).send('Username is already taken')//check real codes
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		console.log(hashedPassword)
		const user = { name: req.body.name, password: hashedPassword}
		users.push(user)
		res.status(201).send('Sign in success')
	}
	catch (err){
		console.error("Auth error: ", err);
		res.status(500).send()
	}
});

module.exports = router;
