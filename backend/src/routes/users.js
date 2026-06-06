const express = require("express");
const router = express.Router();
const OAuth = require("../middlewares/OAuth");

router.use(express.json());

router.get("/me", (req, res) => {
	res.status(200).send("You can see your page here");
});

module.exports = router;
