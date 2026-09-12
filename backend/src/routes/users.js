const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');
const { cleanInput } = require('../services/sanitize');

router.get("/me", authToken, async (req, res) => {
	try{
        const UserId = req.user.id
        const userProfile = await prisma.user.findUnique({
            where: { id: UserId },
            select: {
                id: true, username: true, email: true, avatar: true,
                playerStats: { select: { deaths: true, damageDealt: true, damageReceived: true, goldEarned: true, gameRun: { select: { won: true, lost: true } } } },
            }
        })
        if (!userProfile) {
            return res.status(404).json({ error: "not found" });
        }
        const wins = userProfile.playerStats.filter(stat => stat.gameRun.won).length;
        const losses = userProfile.playerStats.filter(stat => stat.gameRun.lost).length;
        const gamesPlayed = userProfile.playerStats.length;
        const totals = userProfile.playerStats.reduce((sum, stat) => ({
            deaths: sum.deaths + stat.deaths,
            damageDealt: sum.damageDealt + stat.damageDealt,
            damageReceived: sum.damageReceived + stat.damageReceived,
            goldEarned: sum.goldEarned + stat.goldEarned,
        }),
        { deaths: 0, damageDealt: 0, damageReceived: 0, goldEarned: 0 });
        res.json({
            id: userProfile.id,
            username: userProfile.username,
            email: userProfile.email,
            avatar: userProfile.avatar,
            stats: {
                wins,
                losses,
                gamesPlayed,
                winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
                totalDeaths: totals.deaths,
                totalDamageDealt: totals.damageDealt,
                totalDamageReceived: totals.damageReceived,
                totalGoldEarned: totals.goldEarned,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "internal error" });
    }
});

router.get("/search", authToken, async (req, res) => {
	try{
        const srcuser = req.query.search
        if (!srcuser || typeof srcuser !== 'string' || srcuser.trim() === '') {
            return res.status(400).json({ error: "invalid search" });
        }
        const userProfile = await prisma.user.findMany({
            where: {
                username: {
                    contains: srcuser.trim(),
                    mode: 'insensitive'
                }
            },
            select: { id: true, username: true, avatar: true}
        });
        if (userProfile.length === 0) {
            return res.status(404).json({ error: "not found" });
        }
        res.json(userProfile);
    }
    catch (error) {
        res.status(500).json({ error: "internal error" });
    }
});

router.get("/:userId", authToken, async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                error: "invalid user id",
            });
        }

        const userProfile = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                playerStats: {
                    select: {
                        deaths: true,
                        damageDealt: true,
                        damageReceived: true,
                        goldEarned: true,
                        gameRun: {
                            select: {
                                won: true,
                                lost: true,
                            },
                        },
                    },
                },
            },
        });

        if (!userProfile) {
            return res.status(404).json({
                error: "not found",
            });
        }

        const wins = userProfile.playerStats.filter(
            stat => stat.gameRun.won
        ).length;

        const losses = userProfile.playerStats.filter(
            stat => stat.gameRun.lost
        ).length;

        const gamesPlayed = userProfile.playerStats.length;

        const totals = userProfile.playerStats.reduce(
            (sum, stat) => ({
                deaths: sum.deaths + stat.deaths,
                damageDealt:
                    sum.damageDealt + stat.damageDealt,
                damageReceived:
                    sum.damageReceived + stat.damageReceived,
                goldEarned:
                    sum.goldEarned + stat.goldEarned,
            }),
            {
                deaths: 0,
                damageDealt: 0,
                damageReceived: 0,
                goldEarned: 0,
            }
        );

        return res.json({
            id: userProfile.id,
            username: userProfile.username,
            avatar: userProfile.avatar,
            stats: {
                wins,
                losses,
                gamesPlayed,
                winRate: gamesPlayed > 0
                    ? Math.round((wins / gamesPlayed) * 100)
                    : 0,
                totalDeaths: totals.deaths,
                totalDamageDealt: totals.damageDealt,
                totalDamageReceived: totals.damageReceived,
                totalGoldEarned: totals.goldEarned,
            },
        });
    }
    catch (error) {
        console.error("Unable to load public profile:", error);

        return res.status(500).json({
            error: "internal error",
        });
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
            if (typeof username !== 'string')
                return res.status(400).json({ error: "invalid username" });
            const cleanUserName = cleanInput(username.trim());
            if (cleanUserName === '')
                return res.status(400).json({ error: "invalid username" });
            updateData.username = cleanUserName;
        }
        if (avatar !== undefined) {
            if (avatar === null || (typeof avatar === 'string' && avatar === '')) {
                updateData.avatar = null;
            }
            else if (typeof avatar !== 'string') {
                return res.status(400).json({ error: "invalid avatar" });
            }
            else {
                const avatarUrl = cleanInput(avatar.trim());
                if (avatarUrl.length > 500)
                    return res.status(400).json({ error: "invalid avatar" });
                try {
                    const parsedAvatarUrl = new URL(avatarUrl);
                    if (!['http:', 'https:'].includes(parsedAvatarUrl.protocol))
                        return res.status(400).json({ error: "invalid avatar" });
                }
                catch {return res.status(400).json({ error: "invalid avatar" });}
                updateData.avatar = avatarUrl;

            }
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
            return res.status(409).json({ error: "conflict" });
        }
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;
