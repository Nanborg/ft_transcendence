const express = require("express");
const router = express.Router();
const { OAuth } = require("../middlewares/OAuth");
router.use(express.json());
const prisma = require('../db');
const bcrypt = require("bcrypt");




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


router.get("/42", (req, res) => {
	const url =
		"https://api.intra.42.fr/oauth/authorize" +
		"?client_id=" + process.env.FT_CLIENT_ID +
		"&redirect_uri=" + encodeURIComponent("https://localhost/login/42/callback") +
		"&response_type=code";

	return res.redirect(url);
});

router.get("/42/callback", async (req, res) => {
	const code = req.query.code;

	if (!code) {
		return res.status(400).send("Missing code");
	}

	// exchange code for a token
	const response = await fetch("https://api.intra.42.fr/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			grant_type: "authorization_code",
			client_id: process.env.FT_CLIENT_ID,
			client_secret: process.env.FT_CLIENT_SECRET,
			code: code,
			redirect_uri: "https://localhost/login/42/callback",
		}),
	});

	const data = await response.json();
	console.log(data);
	if (!data.access_token) {
		return res.status(401).json(data);
	}

	// call /v2/me to get user data
	const infos_response = await fetch("https://api.intra.42.fr/v2/me", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Bearer " + data.access_token
		}
	});

	const user_data = await infos_response.json();
	console.log(user_data);


	// Chercher/créer l'utilisateur

	user = await prisma.user.findUnique({
	where: { fortyTwoId: user_data.id }
	});

	if (!user)
	{
		user = await prisma.user.findUnique({
		where: { email: user_data.email }
		});
	}
	if (!user)
	{
		try {
			const hashedPassword = await bcrypt.hash("placeholder", 10) //???????????????????????????????????????

			const created = await prisma.user.create({
				data: {
					username: user_data.login,
					email: user_data.email,
					password: hashedPassword
				}
			});

			res.status(201).json({
				message: 'Register success',
				userId: created.id,
				username: created.username
			});
		}
		catch (err){
				if (err.code === 'P2002') {
					return res.status(400).json({ error: 'Email or username already exists' });
			}
	
			console.error("Auth error: ", err);
			res.status(500).send()
		}
	}
	else
		res.status(302).json({
			message: 'already existing ',
			username: user.username
		});
		



	// Générer tes JWT
});



// dev login route, need to add a passowrd to it
//
//		└──>curl -ikX POST\
//			-H "x-dev-user: maxime" \
//			http://localhost:3000/login/dev
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
		username: devUser,
		role: "user",
	};

	res.json(req.user);
});

module.exports = router;
