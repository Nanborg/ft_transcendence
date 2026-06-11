const jwt = require("jsonwebtoken");

async function authToken(req, res, next) {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		
		if (!token)
			return res.sendStatus(401);

		jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, user) => {
			if (err)
				return res.sendStatus(403);
			
			req.user = user;
			next();
		});
	} catch (err) {
		console.error("Auth middleware error: ", err);
		res.status(500).json({ error: 'Server error' });
	}
}

module.exports = authToken;
