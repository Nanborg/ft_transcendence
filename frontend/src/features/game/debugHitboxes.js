import { ENTITY_TYPE } from './gameProtocol';
//test-nico-hitbox pour tout le fichier
const DEBUG_HITBOX_KEY = 'h';

const ATTACK_ENTITY_TYPES = new Set([
    ENTITY_TYPE.LASER_SLASH,
    ENTITY_TYPE.LASER_PROJECTILE,
    ENTITY_TYPE.LASER_SHIELD,
    ENTITY_TYPE.BOSS_PROJECTILE,
    ENTITY_TYPE.ENEMY_PROJECTILE,
    ENTITY_TYPE.ENEMY_MELEE,
    ENTITY_TYPE.BOSS_LASER_PROJECTILE,
]);

export function handleDebugHitboxKeyDown(event, debugHitboxesRef)
{
    if (
        event.key?.toLowerCase() === DEBUG_HITBOX_KEY &&
        !event.repeat &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
    )
    {
        debugHitboxesRef.current = !debugHitboxesRef.current;
        return true;
    }
    return false;
}

export function drawDebugHitboxesIfEnabled(
    debugHitboxesRef,
    context,
    tracks,
    gameMap,
    camera,
    now,
    worldToScreen,
    getInterpolatedPosition
)
{
    if (!debugHitboxesRef.current)
        return;
    drawDebugHitboxes({
        context,
        tracks,
        gameMap,
        camera,
        now,
        worldToScreen,
        getInterpolatedPosition,
    });
}

function getEntityType(entity)
{
    return entity.typeId ?? entity.entityTypeId;
}

function getHitboxStyle(entityType)
{
    if (entityType === ENTITY_TYPE.PLAYER)
        return {stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.10)', label: 'player'};
    if (
        entityType === ENTITY_TYPE.WALKING_ROBOT ||
        entityType === ENTITY_TYPE.SHOOTING_ROBOT ||
        entityType === ENTITY_TYPE.TANK_ROBOT ||
        entityType === ENTITY_TYPE.BOSS
    )
        return {stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.10)', label: 'enemy'};
    if (ATTACK_ENTITY_TYPES.has(entityType))
        return {stroke: '#facc15', fill: 'rgba(250, 204, 21, 0.12)', label: 'attack'};
    return {stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.08)', label: 'entity'};
}

function getHitboxSize(entity, gameMap)
{
    const size = Number(entity?.size);
    if (Number.isFinite(size) && size > 0)
        return size;

    const scale = gameMap?.scale > 0 ? gameMap.scale : 40;
    const entityType = getEntityType(entity);
    if (
        entityType === ENTITY_TYPE.LASER_PROJECTILE ||
        entityType === ENTITY_TYPE.ENEMY_PROJECTILE
    )
        return scale * 0.5;
    if (entityType === ENTITY_TYPE.BOSS_LASER_PROJECTILE)
        return scale * 1.5;
    return scale;
}

function drawOneHitbox({context, entity, position, camera, gameMap, worldToScreen})
{
    if (!entity || typeof position?.x !== 'number' || typeof position?.y !== 'number')
        return;

    const entityType = getEntityType(entity);
    const style = getHitboxStyle(entityType);
    const screen = worldToScreen(position, camera);
    const radius = Math.max(2, getHitboxSize(entity, gameMap) * camera.scale / 2);

    context.lineWidth = 2;
    context.strokeStyle = style.stroke;
    context.fillStyle = style.fill;
    context.beginPath();
    context.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.strokeStyle = style.stroke;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(screen.x - 5, screen.y);
    context.lineTo(screen.x + 5, screen.y);
    context.moveTo(screen.x, screen.y - 5);
    context.lineTo(screen.x, screen.y + 5);
    context.stroke();

    context.font = '700 11px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillStyle = style.stroke;
    context.fillText(
        `${style.label} #${entity.entityId ?? '?'} r${Math.round(radius)}`,
        screen.x,
        screen.y - radius - 4
    );
}

export function drawDebugHitboxes({
    context,
    tracks,
    gameMap,
    camera,
    now,
    worldToScreen,
    getInterpolatedPosition,
})
{
    context.save();
    context.setLineDash([5, 4]);

    if (Array.isArray(gameMap?.entities))
    {
        gameMap.entities.forEach(entity =>
        {
            if (!entity || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
                return;
            drawOneHitbox({
                context,
                entity,
                position: {x: entity.posX, y: entity.posY},
                camera,
                gameMap,
                worldToScreen,
            });
        });
    }

    tracks.forEach(track =>
    {
        drawOneHitbox({
            context,
            entity: track.entity,
            position: getInterpolatedPosition(track, now),
            camera,
            gameMap,
            worldToScreen,
        });
    });
    context.restore();
}
