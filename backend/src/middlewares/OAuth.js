const prisma = require('../db');

module.exports = async (req, res, next) => {
    try {
        const devUser = req.header("x-dev-user");
        if (devUser) {
            const user = await prisma.user.findUnique({
                where: { username: devUser }
            });
            if (user) {
                req.user = { id: user.id };
                return next();
            }
    	}
        req.user = {
            id: 1,
            email: `${devUser || 'fallback'}@local.dev`,
            name: devUser || 'fallback',
            role: "user",
        };
        next();
    }
    catch (error) {
        console.error("Erreur dans le mock OAuth:", error);
        res.status(500).json({ error: "Erreur d'authentification serveur" });
    }
};
