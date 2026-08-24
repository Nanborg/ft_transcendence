const prisma = require('../db');

function adaptPayloadForDB(enginePayload) {
    return {
        roomId: enginePayload.roomId,
        won: enginePayload.reason === "boss_defeated",
        lost: enginePayload.reason === "all_players_dead",
        abandoned: enginePayload.reason === "all_players_left" || enginePayload.reason === "engine_error",
        durationSeconds: enginePayload.durationSeconds,
        players: (Array.isArray(enginePayload.playerData) ? enginePayload.playerData : []).map(p => {
            const upgrades = p.upgrades || {};
            return {
                userId: p.playerId,
                deaths: p.deaths || 0,
                damageDealt: p.damageDealt || 0,
                damageReceived: p.damageReceived || 0,
                goldEarned: p.goldEarned || 0,
                upgrade1: upgrades.melee || 0,
                upgrade2: upgrades.ranged || 0,
                upgrade3: upgrades.shield || 0,
            };
        })
    };
}

async function saveGameResults(gameData) {
    try {
        if (!gameData.roomId || gameData.won === undefined || typeof gameData.durationSeconds !== "number" || !Array.isArray(gameData.players)) {
            throw new Error("Invalid game data");
        }
        const savedGame = await prisma.gameRun.create({
            data: {
                roomId: gameData.roomId,
                won: gameData.won,
                lost: gameData.lost,
                abandoned: gameData.abandoned,
                durationSeconds: gameData.durationSeconds,
                stats: {
                    create: gameData.players.map(player => ({
                        userId: player.userId,
                        deaths: player.deaths,
                        damageDealt: player.damageDealt,
                        damageReceived: player.damageReceived,
                        goldEarned: player.goldEarned || 0,
                        upgrade1: player.upgrade1,
                        upgrade2: player.upgrade2,
                        upgrade3: player.upgrade3
                    }))
                }
            }
        });
        console.log("Game saved successfully, ID:", savedGame.id);
        return savedGame;
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

module.exports = { adaptPayloadForDB, saveGameResults };
