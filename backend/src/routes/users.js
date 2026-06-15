const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
router.use(express.json());

router.use(express.json());

router.get("/me", authToken, (req, res) => {
	res.status(200).send("You can see your page here");
});

router.post('/', async (req, res) => {
    try {
        const { email, username } = req.body;
        const newUser = await prisma.user.create({
            data: { email: email, username: username },
        });
        res.status(201).json({ message: "Joueur créé avec succès !", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible de créer le joueur" });
    }
});

module.exports = router;
