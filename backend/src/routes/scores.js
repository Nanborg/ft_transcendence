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
        const topPlayers = await prisma.playerRunStats.groupBy({
            by: ['userId'],
            _max: {
                score: true
            },
            orderBy:
			[{
				_max: {
					score: 'desc',
				}
			},
			{
				userId: 'asc',
			}],
            take: 10
        });
        res.json(topPlayers);
    }
	catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;