const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require('../middlewares/OAuth');
require("../middlewares/OAuth");

router.use(express.json());

let refreshTokenList = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWVlIiwiaWF0IjoxNzgwODM5OTkxfQ.4Rg7HtbzZ_UB7vEBjSIGqZ87o-hZaI-5d-O-QY6v6Hc"] //to replace by database

router.delete("/", (req, res) => {
	if (!req.body)
		return res.sendStatus(400)
	refreshTokenList = refreshTokenList.filter(token => token !== req.body.token) // to replace with database
	return res.sendStatus(204)
});

module.exports = router;
