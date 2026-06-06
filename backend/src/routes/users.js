const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const OAuth = require("../middlewares/OAuth");

router.get("/me", OAuth, (req, res) => {
	res.json(req.user);
});




//to delete


router.use(express.json());
const users = []
router.get ("/u", (req, res) => {
	res.json(users)
});
router.post ("/u", async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		console.log(hashedPassword)
		const user = { name: req.body.name, password: hashedPassword}
		users.push(user)
		res.status(201).send()
	}
	catch {
		res.status(500).send()
	}
});
router.post ("/u/login", async (req, res) => {
	try {
		const user = users.find(user => user.name = req.body.name)
		if (user == null)
		{
			return res.status(400).send('Can not find user')
		}

		if (await bcrypt.compare(req.body.password, user.password))
		{
			res.send('Connection Succes')
		}
		else
		{
			res.send('Connection not allowed')
		}
	}
	catch {
		res.status(500).send()
	}
});














module.exports = router;
