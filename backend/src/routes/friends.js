const express = require("express");
const router = express.Router();
const OAuth = require("../middlewares/OAuth");
const prisma = require('../db');

router.get("/", OAuth, async (req, res) => {
    try {
        const userWithFriends = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { friends: true }
        });
        res.status(200).json(userWithFriends.friends);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Impossible de récupérer la liste d'amis" });
    }
});

router.post("/:id", OAuth, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id, 10);
        if (isNaN(friendId)) {
            return res.status(400).json({ error: "ID d'ami invalide" });
        }
        if (friendId === req.user.id) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous ajouter vous-même en ami" });
        }
        const targetUser = await prisma.user.findUnique({ where: { id: friendId } });
        if (!targetUser) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                friends: {
                    connect: { id: friendId }
                }
            }
        });
        res.status(200).json({ message: "Ami ajouté avec succès !" });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible d'ajouter cet ami" });
    }
});

router.delete("/:id", OAuth, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id, 10);
        if (isNaN(friendId)) {
            return res.status(400).json({ error: "ID d'ami invalide" });
        }
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                friends: {
                    disconnect: { id: friendId }
                }
            }
        });
        res.status(200).json({ message: "Ami retiré avec succès !" });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Impossible de supprimer cet ami" });
    }
});

module.exports = router;