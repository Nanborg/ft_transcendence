const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');

//Yaoberso / Loufoko
// TODO -> keep the friends list response stable for the frontend.
// The Friends page needs predictable fields for loading, empty state, errors, add, and remove flows.
router.get("/", authToken, async (req, res) => {
    try {
        const userWithFriends = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            }
        });
        if (!userWithFriends) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }
        res.status(200).json(userWithFriends.friends);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Impossible de récupérer la liste d'amis" });
    }
});

//Yaoberso / Loufoko
// TODO -> decide whether friendships are reciprocal or directional before stabilizing this route.
// The Prisma relation and frontend Friends page must agree on what adding a friend means.
router.post("/:id", authToken, async (req, res) => {
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
        const updatedUser2 = await prisma.user.update({
            where: { id: friendId },
            data: {
                friends: {
                    connect: { id: req.user.id }
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
//Yaoberso / Loufoko
// TODO -> keep friend removal consistent with the chosen friendship direction.
// If friendships are reciprocal, deleting a friend must update both users' relations.
router.delete("/:id", authToken, async (req, res) => {
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
        const updatedUser2 = await prisma.user.update({
            where: { id: friendId },
            data: {
                friends: {
                    disconnect: { id: req.user.id }
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