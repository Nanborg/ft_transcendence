const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.use(express.json());


// to delete and replace with data base
const users = [{"name":"Mee", "password":"$2b$10$x/vHkxVIjwyBwpqxOD9yA.tVeOWih3DnJtAgF3jlyMwlZXopqqNxi"}]

router.post ("/", async (req, res) => {
	console.log("OAuth hit");
	try {
		const user = users.find(user => user.name === req.body.name)
		if (user == null)
			return res.status(400).send('Can not find user')

		if (await bcrypt.compare(req.body.password, user.password))
			return res.json({ message: "Connection success" });
		return res.status(401).json({ error: "Invalid credentials" });
	}
	catch {
		res.status(500).send()
	}
});


module.exports = router;
