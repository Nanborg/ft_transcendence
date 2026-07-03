const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const bcrypt = require("bcrypt");
const prisma = require('../db');

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

router.get("/search", authToken, async (req, res) => {
	try{
        const srcuser = req.query.search
        if (!srcuser || typeof srcuser !== 'string' || srcuser.trim() === '') {
            return res.status(400).json({ error: "Veuillez fournir un terme de recherche valide." });
        }
        const userProfile = await prisma.user.findMany({
            where: {
                username: {
                    contains: srcuser.trim(),
                    mode: 'insensitive'
                }
            },
            select: { id: true, username: true, email: true, avatar: true}
        });
        if (userProfile.length === 0) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé." });
        }
        res.json(userProfile);
    }
    catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});



// route to get your informations (profile page maybe ?)

//		└──>curl -i -X GET http://localhost:3000/users/me \
//		 -H "Authorization: Bearer xxxxxxxxxxxxxxxxxx"           # accessToken
//
//
//		HTTP/1.1 200 OK
//		X-Powered-By: Express
//		Content-Type: application/json; charset=utf-8
//		Content-Length: 42
//		ETag: W/"2a-I6hmxzNvY+sYGkXsiDeZm9HbL5k"
//		Date: Tue, 23 Jun 2026 15:07:39 GMT
//		Connection: keep-alive
//		Keep-Alive: timeout=5
//
//		{"id":9,"iat":1782227176,"exp":1782228076}


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
            data: updateData,
            select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
            }
        });
        res.status(200).json(updatedUser);
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
