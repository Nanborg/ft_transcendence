const prisma = require('../db');
const { adaptPayloadForDB, saveGameResults } = require('../services/gameService');
const bcrypt = require('bcrypt');

const mockEnginePayload = {
  roomId: "room-123",
  tick: 8540,
  durationSeconds: 420,
  end: true,
  win: true,
  reason: "boss_defeated",
  entities: [
    {
      entityId: 1,
      typeId: 100,
      posX: 2800,
      posY: 2800,
      velX: 0,
      velY: 0,
      health: 0,
      state: {
        animation: "dead",
        direction: "S"
      }
    }
  ],
  playerData: [
    {
      playerId: 42,
      playerEntityId: 42,
      username: "joueur42",
      deaths: 1,
      alive: true,
      disconnected: false,
      upgrades: { melee: 2, ranged: 1, shield: 3 },
      cooldowns: { melee: 0, ranged: 0, shield: 0 },
      damageDealt: 4500,
      damageReceived: 1200,
    },
    {
      playerId: 8,
      playerEntityId: 43,
      username: "Joueur8",
      deaths: 3,
      alive: false,
      disconnected: false,
      upgrades: { melee: 0, ranged: 3, shield: 0 },
      cooldowns: { melee: 0, ranged: 0, shield: 0 },
      damageDealt: 2100,
      damageReceived: 3500,
    }
  ]
};

async function runTest() {
    try {
		const hashedPassword = await bcrypt.hash("123", 10);
        await prisma.user.upsert({
            where: { id: 42 },
            update: {},
            create: { id: 42, email: "joueur42@test.com", username: "joueur42", password: hashedPassword }
        });
        await prisma.user.upsert({
            where: { id: 8 },
            update: {},
            create: { id: 8, email: "joueur8@test.com", username: "Joueur8", password: hashedPassword }
        });
        console.log("Faux joueurs créés !");

        const formattedData = adaptPayloadForDB(mockEnginePayload);

        await saveGameResults(formattedData);

    } catch (error) {
        console.error("Erreur pendant le test :", error);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();