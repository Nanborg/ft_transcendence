const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
router.use(express.json());

router.get("/me", authToken, async (req, res) => {
	try{
        const UserId = req.user.id
        const userProfile = await prisma.user.findUnique({
            where: { id: UserId },
            select: { id: true, username: true, email: true, avatar: true}
        })
        if (!userProfile) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }
        res.json(userProfile);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
