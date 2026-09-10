class SessionStore
{
    constructor()
    {
        this.sessions = new Map();
    }

    createSession(room)
    {
        if (!room || typeof room.id !== 'string' || !Array.isArray(room.players))
            throw new TypeError('Invalid room');
        const players = room.players.map((player, index) => ({
            userId: player.id,
            username: player.name || 'Player',
            enginePlayerId: index,
        }));
        const session = {
            roomId: room.id,
            players,
            createdAt: Date.now(),
            startedAt: null,
            tick: 0,
            map: null,
            engineMapFile: null,
            entities: new Map(),
            playerData: [],
        };
        this.sessions.set(room.id, session);
        return session;
    }

    getSession(roomId)
    {
        return this.sessions.get(roomId) || null;
    }

    roomIds()
    {
        return this.sessions.keys();
    }

    delete(roomId)
    {
        this.sessions.delete(roomId);
    }

    cacheEntityUpdate(roomId, entity, tick)
    {
        const session = this.getSession(roomId);
        if (!session || !entity || typeof entity.entityId !== 'number')
            return false;
        session.entities.set(entity.entityId, entity);
        if (typeof tick === 'number')
        {
            session.tick = tick;
        }
        return true;
    }

    cacheEntityDelete(roomId, entityId, tick)
    {
        const session = this.getSession(roomId);
        if (!session || typeof entityId !== 'number')
            return false;
        session.entities.delete(entityId);
        if (typeof tick === 'number')
        {
            session.tick = tick;
        }
        return true;
    }

    getStateSnapshot(roomId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        return {
            roomId: session.roomId,
            tick: session.tick,
            serverStartedAt: session.startedAt,
            end: false,
            map: session.map,
            entities: Array.from(session.entities.values()),
            playerData: session.playerData,
        };
    }

    getEnginePlayerId(roomId, userId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        const player = session.players.find((entry) => entry.userId === userId);
        if (player)
            return player.enginePlayerId;
        return null;
    }

    getUserIdByEnginePlayerId(roomId, enginePlayerId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        const player = session.players.find((entry) => entry.enginePlayerId === enginePlayerId);
        if (player)
            return player.userId;
        return null;
    }

    cachePlayerUpdate(roomId, playerData, tick)
    {
        const session = this.getSession(roomId);
        if (
            !session ||
            !playerData ||
            typeof playerData !== 'object' ||
            Array.isArray(playerData) ||
            typeof playerData.playerId !== 'number'
        )
            return null;
        const enginePlayerId = playerData.playerId;
        const userId = this.getUserIdByEnginePlayerId(roomId, enginePlayerId);
        if (userId === null)
            return null;
        const previousIndex = session.playerData.findIndex((player) =>
            String(player.playerId) === String(userId));
        let previousPlayer = null;
        if (previousIndex >= 0)
        {
            previousPlayer = session.playerData[previousIndex];
        }
        const normalizedPlayer = {
            ...previousPlayer,
            ...playerData,
            playerId: userId,
            enginePlayerId,
            upgrades: {
                ...previousPlayer?.upgrades,
                ...playerData.upgrades,
            },
            cooldowns: {
                ...previousPlayer?.cooldowns,
                ...playerData.cooldowns,
            },
        };
        if (previousIndex >= 0)
        {
            session.playerData[previousIndex] = normalizedPlayer;
        }
        else
        {
            session.playerData.push(normalizedPlayer);
        }
        if (typeof tick === 'number')
        {
            session.tick = tick;
        }
        return normalizedPlayer;
    }

    getPlayerData(roomId, userId)
    {
        const session = this.getSession(roomId);
        if (!session)
            return null;
        return session.playerData.find((player) => String(player.playerId) === String(userId)) || null;
    }
}

module.exports = { SessionStore };
