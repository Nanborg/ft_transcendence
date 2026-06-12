const express = require("express");
const router = express.Router();

const OAuth = require("../middlewares/OAuth");

const prisma = require('../db');

router.get("/me", OAuth, (req, res) => {
	res.json(req.user);
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
