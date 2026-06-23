const express = require("express");
const router = express.Router();
const { OAuth } = require("../middlewares/OAuth");



// login route

//		└──>curl -ik -X POST http://localhost:3000/login \
//		 -H "Content-Type: application/json" \
//		 -d '{"name":"MyName","password":"test"}'
//
//		HTTP/1.1 200 OK
//		-Powered-By: Express
//		ontent-Type: application/json; charset=utf-8
//		ontent-Length: 319
//		Tag: W/"13f-f9irrht3GCsp8Fn+qWYkY+kEEMs"
//		ate: Tue, 23 Jun 2026 14:46:07 GMT
//		onnection: keep-alive
//		eep-Alive: timeout=5
//		
//		"message":"Connection success","accessToken":"xxxxxxxxxxxxxxxxx","refreshToken":"yyyyyyyyyyyyyyyyy"}
//
//	note: the access token is valid for 15 min (we can change it) and need to be refreshed with the refresh token (see token.js)


router.post("/", OAuth, (req, res) => {
});





// dev login route, need to add a passowrd to it
//
//		└──>curl -ikX POST\
//		  -H "x-dev-user: maxime" \
//		  http://localhost:3000/login/dev
//
//		HTTP/1.1 200 OK
//		-Powered-By: Express
//		ontent-Type: application/json; charset=utf-8
//		ontent-Length: 73
//		Tag: W/"49-rZWRN4WDRXfRAYGbW1WOySAQiE0"
//		ate: Tue, 23 Jun 2026 14:37:00 GMT
//		onnection: keep-alive
//		eep-Alive: timeout=5

//		{"id":"dev-123","email":"maxime@local.dev","name":"maxime","role":"user"}%    


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
