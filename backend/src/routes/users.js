const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
router.use(express.json());

router.use(express.json());

router.get("/me", authToken, (req, res) => {
	res.status(200).send("You can see your page here");
});

module.exports = router;
