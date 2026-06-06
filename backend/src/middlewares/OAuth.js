

module.exports = (req, res, next) => {
	const devUser = req.header("x-dev-user");

	if (!devUser) {
		return res.status(401).json({
			error: "Unauthorized",
		});
	}

	req.user = {
		id: "dev-123",
		email: `${devUser}@local.dev`,
		name: devUser,
		role: "user",
	};

	next();
};
