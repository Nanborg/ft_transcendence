const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
router.use(express.json());
const bcrypt = require("bcrypt");

router.use(express.json());

const prisma = require('../db');

router.get("/me", authToken, (req, res) => {
	res.json(req.user);
});

router.post('/', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: { 
                email: email, 
                username: username, 
                password: hashedPassword
            }
        });
        res.status(201).json({ message: "Joueur créé avec succès !", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible de créer le joueur" });
    }
});

router.patch('/me', authToken, async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const updateData = {};
        if (username !== undefined) {
            if (typeof username !== 'string' || username.trim() === '') {
                return res.status(400).json({ error: "Le username doit être une chaîne de caractères non vide." });
            }
            updateData.username = username.trim();
        }
        if (avatar !== undefined) {
            if (typeof avatar !== 'string' || avatar.trim() === '') {
                return res.status(400).json({ error: "L'avatar doit être une chaîne de caractères non vide." });
            }
            updateData.avatar = avatar.trim();
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Aucune donnée valide à mettre à jour." });
        }
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });
        res.status(200).json({ message: "Profil mis à jour avec succès !", user: updatedUser });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris." });
        }
        res.status(500).json({ error: "Impossible de mettre à jour le profil." });
    }
});

module.exports = router;
