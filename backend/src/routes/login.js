const express = require("express");
const router = express.Router();

const { OAuth } = require("../middlewares/OAuth");
// protected route
router.post("/", OAuth, (req, res) => {

});

// dev login
router.post("/dev", (req, res, next) => {
	const devUser = req.header("x-dev-user");

	if (!devUser) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	req.user = {
		id: "dev-123",
		email: `${devUser}@local.dev`,
		name: devUser,
		role: "user",
	};

	res.json(req.user);
});

module.exports = router;
