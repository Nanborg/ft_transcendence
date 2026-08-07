const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const prisma = require('../db');

function formatHistoryData(rawGames) {
  return rawGames.map(game => {
    return {
      gameRunId: game.id,
      roomId: game.roomId,
      result: game.abandoned ? "abandoned" : game.won ? "won" : "lost",
      durationSeconds: game.durationSeconds,
      createdAt: new Date(game.createdAt).getTime(),
      players: game.stats.map(stat => {
        return {
          playerId: stat.userId,
          username: stat.user.username,
          deaths: stat.deaths,
          damageDealt: stat.damageDealt,
          damageReceived: stat.damageReceived,
          upgrades: {
            melee: stat.upgrade1,
            ranged: stat.upgrade2,
            shield: stat.upgrade3
          }
        };
      })
    };
  });
}

function formatLeaderboardData(rawGames) {
  return rawGames.map((game, index) => {
    return {
      rank: index + 1,
      gameRunId: game.id,
      roomId: game.roomId,
      durationSeconds: game.durationSeconds,
      createdAt: new Date(game.createdAt).getTime(),
      players: game.stats.map(stat => {
        return {
          playerId: stat.userId,
          username: stat.user.username
        };
      })
    };
  });
}

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
            include: {
                stats: {
                    include: {
                        user: true
                    }
                }
            }
        })
        const cleanHistory = formatHistoryData(gamesStats);
        res.json(cleanHistory);
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
            include: {
                stats: {
                    include: {
                        user: true
                    }
                }
            }
        });
        const cleanLeaderboard = formatLeaderboardData(topGame);
        res.json(cleanLeaderboard);
    }
	catch (error) {
        console.error(error);
        res.status(500).json({ error: "internal error" });
    }
});

module.exports = router;
