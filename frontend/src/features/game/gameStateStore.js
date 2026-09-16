function shallowEqual(first, second)
{
    if (first === second)
        return true;
    if (!first || !second)
        return false;

    const keys = Object.keys(first);
    return keys.length === Object.keys(second).length &&
        keys.every(key =>
            Object.hasOwn(second, key) &&
            Object.is(first[key], second[key])
        );
}

function mergeEntry(previous, update, nestedKeys)
{
    // SYNC: Server deltas omit unchanged nested fields
    const next = { ...previous, ...update };

    for (const key of nestedKeys)
    {
        const nested = { ...previous?.[key], ...update[key] };
        next[key] = shallowEqual(previous?.[key], nested)
            ? previous[key]
            : nested;
    }

    return shallowEqual(previous, next) ? previous : next;
}

export function createGameStateStore()
{
    // WHY: Keep high-frequency game state outside React render state
    const entities = new Map();
    const players = new Map();
    const listeners = new Set();
    let playerData = [];
    let revision = 0;
    let ended = false;

    function subscribe(listener)
    {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function notify(change)
    {
        for (const listener of listeners)
            listener(change);
    }

    function reset(snapshot = {})
    {
        // SYNC: Full snapshots replace every cached entity/player
        entities.clear();
        players.clear();
        ended = snapshot.ended === true;
        revision += 1;

        for (const entity of snapshot.entities ?? [])
        {
            if (entity && typeof entity.entityId === 'number')
                entities.set(entity.entityId, entity);
        }

        for (const player of snapshot.playerData ?? [])
        {
            if (player && typeof player.playerId === 'number')
                players.set(player.playerId, player);
        }

        playerData = Array.from(players.values());
        notify({ reset: true, entityUpdate: [], entityDelete: [] });
    }

    function applyUpdate(payload)
    {
        // SAFETY: Final snapshots should not be changed by late deltas
        if (ended)
            return;

        const entityUpdate = [];
        const entityDelete = [];
        let playersChanged = false;

        for (const update of payload.entityUpdate)
        {
            // SYNC: Entity deltas merge into the cached snapshot
            if (!update || typeof update.entityId !== 'number')
                continue;

            const previous = entities.get(update.entityId);
            const next = mergeEntry(previous, update, ['state']);

            if (next !== previous)
            {
                entities.set(update.entityId, next);
                entityUpdate.push(next);
            }
        }

        for (const deleted of payload.entityDelete)
        {
            // SYNC: Deleted entities are passed to subscribers once for effects
            if (!deleted || typeof deleted.entityId !== 'number')
                continue;

            const previous = entities.get(deleted.entityId);
            entityDelete.push(mergeEntry(previous, deleted, ['state']));
            entities.delete(deleted.entityId);
        }

        for (const update of payload.playerData)
        {
            // SYNC: Player deltas preserve nested upgrades/cooldowns
            if (!update || typeof update.playerId !== 'number')
                continue;

            const previous = players.get(update.playerId);
            const next = mergeEntry(
                previous,
                update,
                ['upgrades', 'cooldowns']
            );

            if (next !== previous)
            {
                players.set(update.playerId, next);
                playersChanged = true;
            }
        }

        if (playersChanged)
            playerData = Array.from(players.values());

        if (playersChanged || entityUpdate.length > 0 ||
            entityDelete.length > 0)
        {
            notify({ reset: false, entityUpdate, entityDelete });
        }
    }

    function createPlayerView(playerId)
    {
        // PERF: Stable snapshots avoid rerendering unchanged HUD data
        let previous;

        return () =>
        {
            const player = playerId == null
                ? null
                : players.get(Number(playerId)) ?? null;
            const entity = player
                ? entities.get(player.playerEntityId)
                : null;
            const health = Number.isFinite(entity?.health)
                ? Math.max(0, entity.health)
                : null;
            const hasEntities = entities.size > 0;

            if (previous && previous.player === player &&
                previous.health === health &&
                previous.hasEntities === hasEntities &&
                previous.revision === revision)
            {
                return previous;
            }

            previous = { player, health, hasEntities, revision };
            return previous;
        };
    }

    return {
        subscribe,
        reset,
        applyUpdate,
        createPlayerView,
        getEntities: () => entities.values(),
        getPlayers: () => playerData,
        getEntity: entityId => entities.get(entityId),
    };
}
