const express = require("express");
const router = express.Router();
router.use(express.json());
const prisma = require('../db');
const {generateAccessToken} = require('../middlewares/OAuth');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const loginLimiter = require('../middlewares/rateLimit');





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


router.post("/", loginLimiter, async (req, res) => {
	try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ error: "Missing username or password" });

        const user = await prisma.user.findUnique({
            where: { username: username }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        return loginUser(user, res, "Dev login success", 200);
    }
	catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/42", (req, res) => {
	const url =
		"https://api.intra.42.fr/oauth/authorize" +
		"?client_id=" + process.env.OAUTH42_CLIENT_ID +
		"&redirect_uri=" + encodeURIComponent("https://localhost:4242/api/login/42/callback") +
		"&response_type=code";

	return res.redirect(url);
});


async function loginUser(user, res, mess, code, isOAuth = false) {
	const payload = {
		id: user.id,
		username: user.username
	};

	const accessToken = generateAccessToken(payload);
	const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_TOKEN, { expiresIn: '7d', algorithm: 'HS256', jwtid: crypto.randomUUID()});

	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + 7)
	await prisma.refreshToken.create({
		data: { token: refreshToken, userId: user.id, expiresAt: expiresAt }
	});

	res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

	if (isOAuth) {
        return res.redirect('/#/login?oauth=success');
    }
	else {
        return res.status(code || 200).json({ message: mess, user: { id: user.id, username: user.username } });
    }
}



router.get("/42/callback", async (req, res) => {
	try{
		const code = req.query.code;

		if (!code || typeof req.query.code !== "string") {
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
				client_id: process.env.OAUTH42_CLIENT_ID,
				client_secret: process.env.OAUTH42_CLIENT_SECRET,
				code: code,
				redirect_uri: "https://localhost:4242/api/login/42/callback",
			}),
		});
		let body = await response.text();
		if (!response.ok) {
			console.error(body);
			return res.status(response.status).send(body);
		}

		const data = JSON.parse(body);
		if (!data.access_token) {
			return res.status(401).json(data);
		}

		// call /v2/me to get user data
		const infos_response = await fetch("https://api.intra.42.fr/v2/me", {
			method: "GET",
			headers: {
				"Authorization": "Bearer " + data.access_token
			}
		});
		body = await infos_response.text();
		if (!infos_response.ok)
		{
			console.error("42 profile fetch failed:", body);
			return res.status(infos_response.status).send(body);
		}

		const userData = JSON.parse(body);
		if (!userData.id || !userData.email)
			return res.sendStatus(500);

		// search/create user
		let user = await prisma.user.findUnique({
		where: { fortyTwoId: userData.id }
		});

		if (user)
			return loginUser(user, res, "Connection success", 200, true);

		user = await prisma.user.findUnique({
			where: { email: userData.email }
		});

		if (user)
		{
			if (!user.fortyTwoId)
			{
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						fortyTwoId: userData.id
					}
				});
			}
			return loginUser(user, res, "Connection success", 200, true);
		}
		try {

			let username = userData.login;
			if (await prisma.user.findUnique({ where: { username } }))
			{
				username = `${userData.login}_${userData.id}`;
				let i = 1;

				while (await prisma.user.findUnique({ where: { username } })) {
					username = `${userData.login}_${userData.id}_${i}`;
					i++;
				}
			}


			const created = await prisma.user.create({
				data: {
					username: username,
					email: userData.email,
					fortyTwoId: userData.id
				}
			});

			return loginUser(created, res, "Register and Connection success", 201, true);
		}
		catch (err){
				if (err.code === 'P2002') {
					return res.status(400).json({ error: 'Email or username already exists' });
			}

			console.error("Error: ", err);
			return res.sendStatus(500);
		}
	}
	catch (err)
	{
		console.error(err);
		console.error(err.cause);
		return res.sendStatus(500);
	}

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
