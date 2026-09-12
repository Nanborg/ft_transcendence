import { ENTITY_TYPE } from '../gameProtocol';
import { VIEW_WIDTH_IN_TILES } from './spriteAssets';
import { getEntityType } from './spriteUtils';

export function getInterpolatedPosition(track, now)
{
    if (track.duration === 0)
        return { x: track.targetX, y: track.targetY };

    const progress = Math.min(1, (now - track.startedAt) / track.duration);

    return {
        x: track.fromX + (track.targetX - track.fromX) * progress,
        y: track.fromY + (track.targetY - track.fromY) * progress,
    };
}

export function getFocusPosition({ tracks, playerData, currentPlayerId, now, gameMap, spectatorIndex })
{
    const localPlayer = playerData.find((player) => String(player.playerId) === String(currentPlayerId));
    if (localPlayer && localPlayer.alive === false)
    {
        const playerTracks = [];
        for (const track of tracks.values())
        {
            if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
            {
                playerTracks.push(track);
            }
        }
        if (playerTracks.length > 0)
        {
            const safeIndex = Math.max(0, spectatorIndex) % playerTracks.length;
            return getInterpolatedPosition(playerTracks[safeIndex], now);
        }
        return {
            x: localPlayer.death_posX || (gameMap?.width ?? 0) / 2,
            y: localPlayer.death_posY || (gameMap?.height ?? 0) / 2,
        };
    }
    const localEntityId = localPlayer?.playerEntityId;
    if (localEntityId != null)
    {
        const localTrack = tracks.get(localEntityId);
        if (localTrack)
            return getInterpolatedPosition(localTrack, now);
    }
    for (const track of tracks.values())
    {
        if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
            return getInterpolatedPosition(track, now);
    }
    return { x: (gameMap?.width ?? 0) / 2, y: (gameMap?.height ?? 0) / 2 };
}

export function getCamera({ canvas, gameMap, focusPosition })
{
    let worldWidth = canvas.width;
    if (gameMap?.width > 0)
    {
        worldWidth = gameMap.width;
    }
    let worldHeight = canvas.height;
    if (gameMap?.height > 0)
    {
        worldHeight = gameMap.height;
    }
    let tileSize = Math.max(1, worldWidth / 50);
    if (gameMap?.scale > 0)
    {
        tileSize = gameMap.scale;
    }
    const wantedViewWidth = Math.min(worldWidth, tileSize * VIEW_WIDTH_IN_TILES);
    const wantedViewHeight = wantedViewWidth * (canvas.height / canvas.width);
    const scale = Math.min(canvas.width / wantedViewWidth, canvas.height / wantedViewHeight);
    const viewportWidth = canvas.width / scale;
    const viewportHeight = canvas.height / scale;
    const maxLeft = Math.max(0, worldWidth - viewportWidth);
    const maxTop = Math.max(0, worldHeight - viewportHeight);
    const left = Math.max(0, Math.min(maxLeft, focusPosition.x - viewportWidth / 2));
    const top = Math.max(0, Math.min(maxTop, focusPosition.y - viewportHeight / 2));
    return {
        left,
        top,
        right: left + viewportWidth,
        bottom: top + viewportHeight,
        scale,
        offsetX: (canvas.width - viewportWidth * scale) / 2,
        offsetY: (canvas.height - viewportHeight * scale) / 2,
        tileSize,
    };
}

export function worldToScreen(position, camera)
{
    return {
        x: camera.offsetX + (position.x - camera.left) * camera.scale,
        y: camera.offsetY + (position.y - camera.top) * camera.scale,
    };
}
