const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');

router.get('/history', authToken, async (req, res) => {
	try{
        const userId = req.user.id
        const gamesStats = await prisma.gameRun.findMany({
            where: {
				stats: {
					some:
					{
						userId: userId
					}
				}
			},
            orderBy: {
                createdAt: 'desc'
            },
            select: { won: true, durationSeconds: true, createdAt: true, stats: true}
        })
        res.json(gamesStats);
    }
    catch (error) {
        res.status(500).json({ error: "internal error" });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
        const topGame = await prisma.gameRun.findMany({
            where: { won: true },
            orderBy:[
                { durationSeconds: 'asc' },
			    { roomId: 'asc',}
            ],
            take: 10,
            include: { stats: true }
        });
        res.json(topGame);
    }
	catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;
