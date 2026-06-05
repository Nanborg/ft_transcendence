const express = require("express");
const router = express.Router();

const OAuth = require("../middlewares/OAuth");

router.get("/me", OAuth, (req, res) => {
	res.json(req.user);
});

module.exports = router;
