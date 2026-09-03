const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');

router.get("/", authToken, async (req, res) => {
    try {
        const userData = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                sentRequests: {
                    include: { friend: { select: { id: true, username: true, avatar: true } } }
                },
                receivedRequests: {
                    include: { user: { select: { id: true, username: true, avatar: true } } }
                }
            }
        });
        if (!userData)
            return res.status(404).json({ error: "User not found" });
        const friends = [
            ...userData.sentRequests.filter(f => f.status === "ACCEPTED").map(f => f.friend),
            ...userData.receivedRequests.filter(f => f.status === "ACCEPTED").map(f => f.user)
        ];
        const pendingSent = userData.sentRequests.filter(f => f.status === "PENDING").map(f => f.friend);
        const pendingReceived = userData.receivedRequests.filter(f => f.status === "PENDING").map(f => f.user);
        res.status(200).json({
            friends,
            pendingReceived,
            pendingSent
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

router.post("/:id", authToken, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id, 10);
        if (isNaN(friendId)) {
            return res.status(400).json({ error: "invalid id" });
        }
        if (friendId === req.user.id) {
            return res.status(409).json({ error: "conflict" });
        }
        const targetUser = await prisma.user.findUnique({ where: { id: friendId } });
        if (!targetUser) {
            return res.status(404).json({ error: "not found" });
        }
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: req.user.id, friendId: friendId },
                    { userId: friendId, friendId: req.user.id },
                ]
            }
        });
        if (existingFriendship)
        {
            if (existingFriendship.status === "ACCEPTED")
                return res.status(409).json({ error: "already friends" });
            if (existingFriendship.userId === req.user.id && existingFriendship.status === "PENDING")
                return res.status(409).json({ error: "request already sent" });
            if (existingFriendship.userId === friendId && existingFriendship.status === "PENDING")
            {
                await prisma.friendship.update({
                    where: { id: existingFriendship.id },
                    data: { status: "ACCEPTED" }
                });
                return res.status(200).json({ message: "POST friends succes" });
            }
        }
        await prisma.friendship.create({
            data: {
                userId: req.user.id,
                friendId: friendId,
                status: "PENDING"
            }
        })
        res.status(200).json({ message: "POST friends succes" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

router.patch("/:id/accept", authToken, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id, 10);
        if (isNaN(friendId)) {
            return res.status(400).json({ error: "invalid id" });
        }
        if (friendId === req.user.id) {
            return res.status(409).json({ error: "conflict" });
        }
        const targetUser = await prisma.user.findUnique({ where: { id: friendId } });
        if (!targetUser) {
            return res.status(404).json({ error: "not found" });
        }
        const requestToAccept = await prisma.friendship.findFirst({
            where: {
                userId: friendId,
                friendId: req.user.id,
                status: "PENDING"
            }
        });
        if (!requestToAccept)
            return res.status(404).json({ error: "No pending request from this user" });
        await prisma.friendship.update({
            where: { id: requestToAccept.id},
            data: { status: "ACCEPTED" }
        });
        res.status(200).json({ message: "PATCH friends succes" })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
})

router.delete("/:id", authToken, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id, 10);
        if (isNaN(friendId)) {
            return res.status(400).json({ error: "invalid id" });
        }
        if (friendId === req.user.id) {
            return res.status(409).json({ error: "conflict" });
        }
        const targetUser = await prisma.user.findUnique({ where: { id: friendId } });
        if (!targetUser) {
            return res.status(404).json({ error: "not found" });
        }
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: req.user.id, friendId: friendId },
                    { userId: friendId, friendId: req.user.id },
                ]
            }
        });
        if (existingFriendship) {
            await prisma.friendship.delete({
                where: { id: existingFriendship.id }
            });
            return res.status(200).json({ message: "DELETE friends succes" });
        }
        return res.status(404).json({ error: "no relationship found" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;
