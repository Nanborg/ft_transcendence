const BATCH_DELAY_MS = 16;

function createGameStateBatcher(io, getSession)
{
    const pending = new Map();
    const endedSessions = new WeakSet();

    function flush(roomId)
    {
        const batch = pending.get(roomId);
        if (!batch)
            return;
        pending.delete(roomId);
        clearTimeout(batch.timer);
        if (getSession(roomId) !== batch.session ||
            endedSessions.has(batch.session))
            return;
        io.to(roomId).emit('game:state:update', batch.payload);
    }

    function enqueue(payload)
    {
        const session = getSession(payload.roomId);
        if (!session || endedSessions.has(session))
            return;
        let batch = pending.get(payload.roomId);
        if (batch && (
            batch.session !== session ||
            batch.payload.tick !== payload.tick ||
            payload.entityUpdate.some(entity =>
                batch.deletedIds.has(entity.entityId))
        ))
        {
            flush(payload.roomId);
            batch = null;
        }

        if (!batch)
        {
            batch = {
                session,
                deletedIds: new Set(),
                payload: {
                    roomId: payload.roomId,
                    tick: payload.tick,
                    end: false,
                    entityUpdate: [],
                    entityDelete: [],
                    playerData: [],
                },
                timer: setTimeout(
                    () => flush(payload.roomId),
                    BATCH_DELAY_MS
                ),
            };
            batch.timer.unref();
            pending.set(payload.roomId, batch);
        }
        for (const entity of payload.entityUpdate)
            batch.payload.entityUpdate.push(entity);
        for (const entity of payload.entityDelete)
        {
            batch.payload.entityDelete.push(entity);
            batch.deletedIds.add(entity.entityId);
        }
        for (const player of payload.playerData)
            batch.payload.playerData.push(player);
    }

    function end(roomId)
    {
        flush(roomId);
        const session = getSession(roomId);
        if (session)
            endedSessions.add(session);
    }

    function clear()
    {
        for (const batch of pending.values())
            clearTimeout(batch.timer);
        pending.clear();
    }

    return { enqueue, flush, end, clear };
}

module.exports = { createGameStateBatcher };