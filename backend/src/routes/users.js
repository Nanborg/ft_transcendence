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

router.patch('/me', OAuth, async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const dataToUpdate = {};
        if (username !== undefined)
            dataToUpdate.username = username;
        if (avatar !== undefined)
            dataToUpdate.avatar = avatar;
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ error: "Aucune donnée valide à mettre à jour" });
        }
        const UpdateUser = await prisma.user.update({
            where: { id: req.user.id },
            data: dataToUpdate
        })
        res.status(200).json({ message: "Joueur modifié avec succès !", user: UpdateUser });
    }
    catch(error)
    {
        console.error(error);
        res.status(400).json({ error: "Impossible de modifié le joueur" });
    }
})

module.exports = router;
