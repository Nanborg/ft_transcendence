const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {generateAccessToken} = require('../middlewares/OAuth');
require("../middlewares/OAuth");

router.use(express.json());

let refreshTokenList = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTWVlIiwiaWF0IjoxNzgwODM5OTkxfQ.4Rg7HtbzZ_UB7vEBjSIGqZ87o-hZaI-5d-O-QY6v6Hc"] //to replace by database

router.post("/", (req, res) => {
	const refreshToken = req.body && req.body.token
	if (refreshToken == null)
		return res.sendStatus(401)
	if (!refreshTokenList.includes(refreshToken))
		return res.sendStatus(403)
	jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
		if (err)
			return (res.sendStatus(403))
		const accessToken = generateAccessToken({name: user.name})
		res.json({accessToken: accessToken})
	})
	
});

module.exports = router;
