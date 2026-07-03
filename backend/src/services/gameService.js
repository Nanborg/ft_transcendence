const prisma = require('../db');

// const mockGameData = {
//     roomId: "room-1718362",
//     won: true,
//     durationSeconds: 300,
//     players: [
//         { userId: 42, score: 85, xp: 450 },
//         { userId: 8, score: 62, xp: 350 }
//     ]
// };

async function saveGameResults(gameData) {
    try {
        if (!gameData.roomId || gameData.won === undefined || !gameData.durationSeconds || !gameData.players || gameData.players.length === 0) {
            throw new Error("Invalid game data");
        }
        const savedGame = await prisma.gameRun.create({
            data: {
                roomId: gameData.roomId,
                won: gameData.won,
                durationSeconds: gameData.durationSeconds,
                stats: {
                    create: gameData.players.map(player => ({
                        userId: player.userId,
                        score: player.score,
                        xp: player.xp
                    }))
                }
            },
            // include: {
            //     stats: true
            // }
        });
        console.log("Game saved successfully, ID:", savedGame.id);
        // console.log(JSON.stringify(savedGame, null, 2));
        return savedGame;
    }
	catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

// async function runTest() {
//     try {
//         await prisma.user.upsert({
//             where: { id: 42 },
//             update: {},
//             create: { id: 42, email: "joueur42@test.com", username: "Joueur42" }
//         });
//         await prisma.user.upsert({
//             where: { id: 8 },
//             update: {},
//             create: { id: 8, email: "joueur8@test.com", username: "Joueur8" }
//         });
//         console.log("Faux joueurs 42 et 8 créés ou déjà existants dans la BDD !");
//         await saveGameResults(mockGameData);

//     } catch (error) {
//         console.error("Erreur pendant le test :", error);
//     }
// }

// runTest();

module.exports = { saveGameResults };