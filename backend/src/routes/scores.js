const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');

// TODO(yaoberso): Ensure history and leaderboard only read server-saved
// GameRun/PlayerRunStats rows created from a validated game:end result.
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
            select: {
                id: true,
                roomId: true,
                won: true,
                durationSeconds: true,
                createdAt: true,
                stats: true
            }
        })
        res.json(gamesStats.map((gameRun) => ({
            gameRunId: gameRun.id,
            roomId: gameRun.roomId,
            won: gameRun.won,
            durationSeconds: gameRun.durationSeconds,
            createdAt: gameRun.createdAt,
            players: gameRun.stats
        })));
    }
    catch (error) {
        res.status(500).json({ error: "internal error" });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
        const gameRuns = await prisma.gameRun.findMany({
            where: {
                won: true
            },
            orderBy: {
                durationSeconds: 'asc'
            },
            take: 10,
            select: {
                id: true,
                roomId: true,
                durationSeconds: true,
                createdAt: true,
                stats: true
            }
        });

        res.json(gameRuns.map((gameRun, index) => ({
            rank: index + 1,
            gameRunId: gameRun.id,
            roomId: gameRun.roomId,
            durationSeconds: gameRun.durationSeconds,
            createdAt: gameRun.createdAt,
            players: gameRun.stats
        })));
    }
	catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;
