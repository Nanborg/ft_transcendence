const express = require("express");
const router = express.Router();

const OAuth = require("../middlewares/OAuth");

router.get("/", OAuth, (req, res) => {
	res.json({ secret: true });
});

module.exports = router;
