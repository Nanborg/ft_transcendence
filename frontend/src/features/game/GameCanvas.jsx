import { useEffect, useRef } from 'react';
import { ENTITY_TYPE, PLAYER_ACTION } from './gameProtocol';
import playerWalkSpriteUrl from '../../assets/game/player/player-walk.png';
import playerMeleeAttackSpriteUrl from '../../assets/game/player/player-melee-attack.png';
import playerRangedAttackSpriteUrl from '../../assets/game/player/player-ranged-attack.png';
import walkingRobotSpriteUrl from '../../assets/game/enemies/walking-robot.png';
import shootingRobotSpriteUrl from '../../assets/game/enemies/shooting-robot.png';
import tankRobotIdleSpriteUrl from '../../assets/game/enemies/tank-robot-idle.png';
import playerIdleSpriteUrl from '../../assets/game/player/player-idle.png';
import walkingRobotIdleSpriteUrl from '../../assets/game/enemies/walking-robot-idle.png';
import shootingRobotIdleSpriteUrl from '../../assets/game/enemies/shooting-robot-idle.png';
import shootingRobotAttackSpriteUrl from '../../assets/game/enemies/shooting-robot-attack.png';
import lordGoobIdleSpriteUrl from '../../assets/game/enemies/lord-goob-idle.png';
import walkingRobotChargeSpriteUrl from '../../assets/game/enemies/walking-robot-charge.png';

const CANVAS_WIDTH = 800;
const MIN_CANVAS_HEIGHT = 450;
const MAX_CANVAS_HEIGHT = 800;
const VIEW_WIDTH_IN_TILES = 20;
const INTERPOLATION_DURATION_MS = 100;
const STATIC_MAP_ENTITY_TYPES = new Set([
    ENTITY_TYPE.WALL,
    ENTITY_TYPE.CHECKPOINT,
    ENTITY_TYPE.SPAWN_POINT,
]);
const PLAYER_SPRITE_CELL_SIZE = 256;
const PLAYER_WALK_FRAME_COUNT = 4;
const PLAYER_WALK_FRAME_DURATION_MS = 125;
const PLAYER_IDLE_FRAME_COUNT = 4;
const PLAYER_IDLE_FRAME_DURATION_MS = 240;
const playerIdleSprite = new Image();
playerIdleSprite.src = playerIdleSpriteUrl;
const PLAYER_ATTACK_FRAME_COUNT = 6;
const PLAYER_MELEE_FRAME_DURATION_MS = 60;
const PLAYER_RANGED_FRAME_DURATION_MS = 50;
const playerWalkSprite = new Image();
playerWalkSprite.src = playerWalkSpriteUrl;
const playerMeleeAttackSprite = new Image();
playerMeleeAttackSprite.src = playerMeleeAttackSpriteUrl;
const playerRangedAttackSprite = new Image();
playerRangedAttackSprite.src = playerRangedAttackSpriteUrl;
const WALKING_ROBOT_FRAME_COUNT = 4;
const WALKING_ROBOT_FRAME_DURATION_MS = 140;
const walkingRobotSprite = new Image();
walkingRobotSprite.src = walkingRobotSpriteUrl;
const WALKING_ROBOT_IDLE_FRAME_DURATION_MS = 260;
const walkingRobotIdleSprite = new Image();
walkingRobotIdleSprite.src = walkingRobotIdleSpriteUrl;
const walkingRobotChargeSprite = new Image();
walkingRobotChargeSprite.src = walkingRobotChargeSpriteUrl;
const SHOOTING_ROBOT_FRAME_COUNT = 4;
const SHOOTING_ROBOT_FRAME_DURATION_MS = 140;
const shootingRobotSprite = new Image();
shootingRobotSprite.src = shootingRobotSpriteUrl;
const SHOOTING_ROBOT_WALK_COLUMNS = Object.freeze([
    { x: 125, width: 162 },
    { x: 412, width: 160 },
    { x: 689, width: 167 },
    { x: 963, width: 163 },
]);
const SHOOTING_ROBOT_WALK_ROWS = Object.freeze([
    { y: 85, height: 217 },
    { y: 361, height: 220 },
    { y: 653, height: 216 },
    { y: 924, height: 213 },
]);
const SHOOTING_ROBOT_IDLE_FRAME_DURATION_MS = 260;
const shootingRobotIdleSprite = new Image();
shootingRobotIdleSprite.src = shootingRobotIdleSpriteUrl;
const shootingRobotAttackSprite = new Image();
shootingRobotAttackSprite.src = shootingRobotAttackSpriteUrl;
const TANK_ROBOT_FRAME_COUNT = 4;
const TANK_ROBOT_FRAME_DURATION_MS = 220;
const TANK_ROBOT_SOURCE_ROWS = Object.freeze([
    {y: 0, height: 308},
    {y: 308, height: 313},
    {y: 621, height: 308},
    {y: 929, height: 349},
]);
const TANK_ROBOT_SOURCE_COLUMNS = Object.freeze([
    { x: 0, width: 320 },
    { x: 320, width: 308 },
    { x: 628, width: 299 },
    { x: 927, width: 303 },
]);
const SOURCE_GRID_1254_COLUMNS = Object.freeze([
    {x: 0, width: 314},
    {x: 314, width: 313},
    {x: 627, width: 314},
    {x: 941, width: 313},
]);
const SOURCE_GRID_1254_ROWS = Object.freeze([
    {y: 0, height: 314},
    {y: 314, height: 313},
    {y: 627, height: 314},
    {y: 941, height: 313},
]);
const WALKING_ROBOT_IDLE_COLUMNS = Object.freeze([
    {x: 0, width: 315},
    {x: 315, width: 316},
    {x: 631, width: 315},
    {x: 946, width: 315},
]);
const WALKING_ROBOT_IDLE_ROWS = Object.freeze([
    {y: 0, height: 312},
    {y: 312, height: 312},
    {y: 624, height: 311},
    {y: 935, height: 312},
]);
const SHOOTING_ROBOT_IDLE_COLUMNS = Object.freeze([
    { x: 72, width: 207 },
    { x: 376, width: 206 },
    { x: 675, width: 209 },
    { x: 967, width: 206 },
]);
const SHOOTING_ROBOT_IDLE_ROWS = Object.freeze([
    { y: 46, height: 254 },
    { y: 335, height: 262 },
    { y: 631, height: 257 },
    { y: 924, height: 263 },
]);
const SHOOTING_ROBOT_ATTACK_COLUMNS = Object.freeze([
    { x: 111, width: 169 },
    { x: 377, width: 204 },
    { x: 663, width: 213 },
    { x: 977, width: 165 },
]);
const SHOOTING_ROBOT_ATTACK_ROWS = Object.freeze([
    { y: 68, height: 207 },
    { y: 369, height: 204 },
    { y: 663, height: 201 },
    { y: 898, height: 274 },
]);
const PLAYER_WALK_ANCHOR_X = Object.freeze([
    [0.6499, 0.5378, 0.4552, 0.3688],
    [0.6463, 0.5391, 0.4398, 0.3738],
    [0.6302, 0.5247, 0.4322, 0.3585],
    [0.6253, 0.5207, 0.4148, 0.3671],
]);
const PLAYER_WALK_ANCHOR_Y = Object.freeze([
    [0.6074, 0.6059, 0.6099, 0.6070],
    [0.4883, 0.5090, 0.5099, 0.5107],
    [0.4227, 0.4383, 0.4345, 0.4337],
    [0.3048, 0.3099, 0.3130, 0.3027],
]);
const PLAYER_IDLE_ANCHOR_X = Object.freeze([
    [0.6566, 0.5694, 0.4580, 0.3677],
    [0.6645, 0.5781, 0.4773, 0.3883],
    [0.6359, 0.5455, 0.4469, 0.3471],
    [0.6565, 0.5696, 0.4583, 0.3674],
]);
const PLAYER_IDLE_ANCHOR_Y = Object.freeze([
    [0.5946, 0.5953, 0.5953, 0.5950],
    [0.4779, 0.4783, 0.4774, 0.4766],
    [0.4024, 0.4026, 0.4022, 0.4021],
    [0.2929, 0.2935, 0.2938, 0.2934],
]);
const WALKING_ROBOT_IDLE_ANCHOR_X = Object.freeze([
    [0.6059, 0.5500, 0.4853, 0.3886],
    [0.6114, 0.5658, 0.4994, 0.4390],
    [0.5802, 0.5498, 0.4711, 0.4088],
    [0.6024, 0.5529, 0.4590, 0.3916],
]);
const WALKING_ROBOT_WALK_ANCHOR_X = Object.freeze([
    [0.6306, 0.5399, 0.4506, 0.4952],
    [0.4777, 0.5272, 0.5207, 0.4760],
    [0.5000, 0.5064, 0.4873, 0.4776],
    [0.5000, 0.5000, 0.5016, 0.4712],
]);
const WALKING_ROBOT_WALK_ANCHOR_Y = Object.freeze([
    [0.5924, 0.5987, 0.5876, 0.5462],
    [0.5096, 0.4649, 0.4744, 0.4744],
    [0.5239, 0.5350, 0.5318, 0.5048],
    [0.5000, 0.5000, 0.5000, 0.4617],
]);
const WALKING_ROBOT_IDLE_ANCHOR_Y = Object.freeze([
    [0.5481, 0.5769, 0.5481, 0.5481],
    [0.5048, 0.4856, 0.5256, 0.4696],
    [0.5064, 0.5129, 0.5000, 0.5064],
    [0.5000, 0.4728, 0.4551, 0.5000],
]);
const WALKING_ROBOT_CHARGE_ANCHOR_X = Object.freeze([
    [0.5048, 0.4505, 0.5844, 0.3882],
    [0.5414, 0.6070, 0.5127, 0.5559],
    [0.4713, 0.5719, 0.4904, 0.4984],
    [0.5064, 0.5032, 0.4013, 0.4425],
]);
const WALKING_ROBOT_CHARGE_ANCHOR_Y = Object.freeze([
    [0.5876, 0.7070, 0.5717, 0.7038],
    [0.4521, 0.4473, 0.4201, 0.4505],
    [0.5048, 0.5525, 0.5414, 0.5048],
    [0.4617, 0.4489, 0.5383, 0.4617],
]);
const WALKING_ROBOT_CHARGE_OFFSET = Object.freeze([
    0,
    0.08,
    0.28,
    0.06,
]);
const WALKING_ROBOT_AFTERIMAGES = Object.freeze([
    { distance: 0.25, opacity: 0.28 },
    { distance: 0.5, opacity: 0.16 },
    { distance: 0.75, opacity: 0.08 },
]);
const SHOOTING_ROBOT_IDLE_ANCHOR_X = Object.freeze([
    [0.4887, 0.4934, 0.5182, 0.4953],
    [0.4767, 0.4936, 0.5158, 0.5372],
    [0.4948, 0.5026, 0.4907, 0.5244],
    [0.4971, 0.5052, 0.4858, 0.5053],
]);
const SHOOTING_ROBOT_IDLE_ANCHOR_Y = Object.freeze([
    [0.9843, 0.9764, 0.9803, 0.9803],
    [0.9733, 0.9847, 0.9847, 0.9809],
    [0.9844, 0.9844, 0.9844, 0.9883],
    [0.9848, 0.9848, 0.9848, 0.9848],
]);
const SHOOTING_ROBOT_WALK_ANCHOR_X = Object.freeze([
    [0.5370, 0.6022, 0.5848, 0.4473],
    [0.5358, 0.4926, 0.4329, 0.4533],
    [0.4929, 0.5047, 0.3839, 0.4010],
    [0.4531, 0.5441, 0.4218, 0.4429],
]);
const SHOOTING_ROBOT_WALK_ANCHOR_Y = Object.freeze([
    [0.9724, 0.9770, 0.9770, 0.9770],
    [0.9818, 0.9818, 0.9818, 0.9818],
    [0.9815, 0.9815, 0.9769, 0.9815],
    [0.9812, 0.9812, 0.9765, 0.9812],
]);
const SHOOTING_ROBOT_ATTACK_ANCHOR_X = Object.freeze([
    [0.5095, 0.5208, 0.4962, 0.5012],
    [0.5250, 0.5562, 0.5346, 0.5314],
    [0.4583, 0.4869, 0.4736, 0.4495],
    [0.4940, 0.5226, 0.5048, 0.4958],
]);
const SHOOTING_ROBOT_ATTACK_ANCHOR_Y = Object.freeze([
    [0.9807, 0.9807, 0.9807, 0.9807],
    [0.9804, 0.9755, 0.9755, 0.9755],
    [0.9801, 0.9801, 0.9801, 0.9801],
    [0.9854, 0.9854, 0.9854, 0.9854],
]);
const tankRobotIdleSprite = new Image();
tankRobotIdleSprite.src = tankRobotIdleSpriteUrl;
const LORD_GOOB_FRAME_COUNT = 4;
const LORD_GOOB_FRAME_DURATION_MS = 260;
const LORD_GOOB_SOURCE_COLUMNS = Object.freeze([
    { x: 0, width: 304 },
    { x: 304, width: 305 },
    { x: 609, width: 304 },
    { x: 913, width: 304 },
]);
const LORD_GOOB_SOURCE_ROWS = Object.freeze([
    { y: 0, height: 323 },
    { y: 323, height: 324 },
    { y: 647, height: 323 },
    { y: 970, height: 323 },
]);
const LORD_GOOB_IDLE_ANCHOR_X = Object.freeze([
    [0.5801, 0.5434, 0.5186, 0.4848],
    [0.5904, 0.5442, 0.5028, 0.4833],
    [0.5759, 0.5372, 0.4996, 0.4740],
    [0.5715, 0.5393, 0.5078, 0.4808],
]);
const lordGoobIdleSprite = new Image();
lordGoobIdleSprite.src = lordGoobIdleSpriteUrl;

function getInterpolatedPosition(track, now)
{
    if (track.duration === 0)
        return {x: track.targetX, y: track.targetY};

    const progress = Math.min(1, (now - track.startedAt) / track.duration);

    return {
        x: track.fromX + (track.targetX - track.fromX) * progress,
        y: track.fromY + (track.targetY - track.fromY) * progress,
    };
}

function getEntityType(entity) { return entity.typeId ?? entity.entityTypeId; }

function getFocusPosition({tracks, playerData, currentPlayerId, now, gameMap, spectatorIndex})
{
    const localPlayer = playerData.find(player => String(player.playerId) === String(currentPlayerId));
    if (localPlayer && localPlayer.alive === false)
    {
        const playerTracks = [];
        for (const track of tracks.values())
        {
            if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
                playerTracks.push(track);
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
    return {x: (gameMap?.width ?? 0) / 2, y: (gameMap?.height ?? 0) / 2};
}

function getCamera({canvas, gameMap, focusPosition})
{
    const worldWidth = gameMap?.width > 0 ? gameMap.width : canvas.width;
    const worldHeight = gameMap?.height > 0 ? gameMap.height : canvas.height;
    const tileSize = gameMap?.scale > 0 ? gameMap.scale : Math.max(1, worldWidth / 50);
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

function worldToScreen(position, camera)
{
    return {
        x: camera.offsetX + (position.x - camera.left) * camera.scale,
        y: camera.offsetY + (position.y - camera.top) * camera.scale,
    };
}

function drawGoldFeedbacks({context, tracks, feedbacks, camera, now})
{
    if (!Array.isArray(feedbacks) || feedbacks.length === 0)
        return;

    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = '700 18px Arial';
    feedbacks.forEach(feedback =>
    {
        const track = tracks.get(feedback.playerEntityId);
        if (!track)
            return;
        const age = now - feedback.createdAt;
        const progress = Math.min(1, Math.max(0, age / 1000));
        const position = getInterpolatedPosition(track, now);
        const screen = worldToScreen(position, camera);
        const sign = feedback.type === 'gain' ? '+' : '-';
        const color = feedback.type === 'gain' ? '#facc15' : '#ef4444';
        const y = screen.y - 35 - progress * 25;

        context.globalAlpha = 1 - progress;
        context.lineWidth = 4;
        context.strokeStyle = 'rgba(2, 6, 23, 0.85)';
        context.fillStyle = color;
        context.strokeText(`${sign}${feedback.amount}`, screen.x, y);
        context.fillText(`${sign}${feedback.amount}`, screen.x, y);
    });
    context.restore();
}

function drawGrid(context, canvas, camera)
{
    const tilePixels = camera.tileSize * camera.scale;

    if (tilePixels < 4)
        return;

    const firstColumn = Math.ceil(camera.left / camera.tileSize);
    const lastColumn = Math.floor(camera.right / camera.tileSize);
    const firstRow = Math.ceil(camera.top / camera.tileSize);
    const lastRow = Math.floor(camera.bottom / camera.tileSize);

    context.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    context.lineWidth = 1;
    context.beginPath();

    for (let column = firstColumn; column <= lastColumn; column += 1)
    {
        const x = camera.offsetX + (column * camera.tileSize - camera.left) * camera.scale;
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }

    for (let row = firstRow; row <= lastRow; row += 1)
    {
        const y = camera.offsetY + (row * camera.tileSize - camera.top) * camera.scale;
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
    }
    context.stroke();
}

function drawDiamond(context, x, y, radius, color)
{
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y - radius);
    context.lineTo(x + radius, y);
    context.lineTo(x, y + radius);
    context.lineTo(x - radius, y);
    context.closePath();
    context.fill();
}

function getPlayerDirectionRow(entity, fallbackRow = 0)
{
    const velocityX = typeof entity.velX === 'number' ? entity.velX : 0;
    const velocityY = typeof entity.velY === 'number' ? entity.velY : 0;

    if (Math.abs(velocityX) > Math.abs(velocityY))
        return velocityX < 0 ? 1 : 2;

    if (Math.abs(velocityY) > 0)
        return velocityY < 0 ? 3 : 0;

    const direction = entity.state?.direction;

    if (typeof direction === 'string')
    {
        if (direction.includes('W'))
            return 1;
        if (direction.includes('E'))
            return 2;
        if (direction.includes('N'))
            return 3;
    }
    return fallbackRow;
}

function getDirectionRowToward(sourcePosition, targetPosition, fallbackRow = 0)
{
    if (!sourcePosition || !targetPosition)
        return fallbackRow;
    const deltaX = targetPosition.x - sourcePosition.x;
    const deltaY = targetPosition.y - sourcePosition.y;
    if (deltaX === 0 && deltaY === 0)
        return fallbackRow;
    if (Math.abs(deltaX) > Math.abs(deltaY))
        return deltaX < 0 ? 1 : 2;
    return deltaY < 0 ? 3 : 0;
}

function getSpriteSource({columns, rows, frame, directionRow, anchorXs = null, anchorYs = null})
{
    const column = columns[frame] ?? columns[0];
    const row = rows[directionRow] ?? rows[0];
    const anchorX = anchorXs?.[directionRow]?.[frame] ?? 0.5;
    const anchorY = anchorYs?.[directionRow]?.[frame] ?? 0.5;
    return {
        x: column.x,
        y: row.y,
        width: column.width,
        height: row.height,
        anchorX,
        anchorY,
    };
}

function getPlayerAttackDuration(action)
{
    if (action === PLAYER_ACTION.MELEE)
        return PLAYER_ATTACK_FRAME_COUNT * PLAYER_MELEE_FRAME_DURATION_MS;
    if (action === PLAYER_ACTION.RANGED)
        return PLAYER_ATTACK_FRAME_COUNT * PLAYER_RANGED_FRAME_DURATION_MS;
    return 0;
}

function drawPlayerAttackSprite({context, screen, tilePixels, now, attack, directionRow = 0})
{
    if (!attack)
        return false;

    const isMelee = attack.action === PLAYER_ACTION.MELEE;
    const isRanged = attack.action === PLAYER_ACTION.RANGED;
    if (!isMelee && !isRanged)
        return false;

    const sprite = isMelee ? playerMeleeAttackSprite : playerRangedAttackSprite;
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;

    const frameDuration = isMelee ? PLAYER_MELEE_FRAME_DURATION_MS : PLAYER_RANGED_FRAME_DURATION_MS;
    const elapsed = now - attack.startedAt;
    const duration = getPlayerAttackDuration(attack.action);
    if (elapsed < 0 || elapsed >= duration)
        return false;

    const frame = Math.min(PLAYER_ATTACK_FRAME_COUNT - 1, Math.floor(elapsed / frameDuration));
    const sourceX = frame * PLAYER_SPRITE_CELL_SIZE;
    const sourceY = directionRow * PLAYER_SPRITE_CELL_SIZE;
    const spriteSize = tilePixels * 1.8;
    const centerX = screen.x;
    const centerY = screen.y;

    context.drawImage(
        sprite,
        sourceX,
        sourceY,
        PLAYER_SPRITE_CELL_SIZE,
        PLAYER_SPRITE_CELL_SIZE,
        centerX - spriteSize / 2,
        centerY - spriteSize / 2,
        spriteSize,
        spriteSize
    );
    return true;
}

function drawPlayerWalkSprite({context, entity, screen, tilePixels, now, directionRow = 0})
{
    const isMoving = entity.velX !== 0 || entity.velY !== 0;
    const sprite = isMoving ? playerWalkSprite : playerIdleSprite;
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;
    const frameDuration = isMoving ? PLAYER_WALK_FRAME_DURATION_MS : PLAYER_IDLE_FRAME_DURATION_MS;
    const frameCount = isMoving ? PLAYER_WALK_FRAME_COUNT : PLAYER_IDLE_FRAME_COUNT;
    const frame = Math.floor(now / frameDuration) % frameCount;

    const source = getSpriteSource({
        columns: SOURCE_GRID_1254_COLUMNS,
        rows: SOURCE_GRID_1254_ROWS,
        frame,
        directionRow,
        anchorXs: isMoving ? PLAYER_WALK_ANCHOR_X : PLAYER_IDLE_ANCHOR_X,
        anchorYs: isMoving ? PLAYER_WALK_ANCHOR_Y : PLAYER_IDLE_ANCHOR_Y,
    });
    const spriteSize = tilePixels * 1.8;
    const centerX = screen.x;
    const centerY = screen.y;

    context.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        centerX - source.anchorX * spriteSize,
        centerY - source.anchorY * spriteSize,
        spriteSize,
        spriteSize
    );

    return true;
}

function drawWalkingRobotSprite({
    context,
    entity,
    screen,
    tilePixels,
    now,
    directionRow,
}) {
    const isCharging = entity.state?.action === 'charge';
    const isMoving = !isCharging && (entity.velX !== 0 || entity.velY !== 0);
    let sprite = walkingRobotIdleSprite;
    let columns = WALKING_ROBOT_IDLE_COLUMNS;
    let rows = WALKING_ROBOT_IDLE_ROWS;
    let anchorXs = WALKING_ROBOT_IDLE_ANCHOR_X;
    let anchorYs = WALKING_ROBOT_IDLE_ANCHOR_Y;
    let frame = Math.floor(now / WALKING_ROBOT_IDLE_FRAME_DURATION_MS) % WALKING_ROBOT_FRAME_COUNT;
    let renderDirectionRow = directionRow;

    if (isCharging)
    {
        sprite = walkingRobotChargeSprite;
        columns = SOURCE_GRID_1254_COLUMNS;
        rows = SOURCE_GRID_1254_ROWS;
        anchorXs = WALKING_ROBOT_CHARGE_ANCHOR_X;
        anchorYs = WALKING_ROBOT_CHARGE_ANCHOR_Y;
        const engineFrame = Number(entity.state?.attackFrame);
        frame = Number.isInteger(engineFrame)
            ? Math.max(0, Math.min(
                WALKING_ROBOT_FRAME_COUNT - 1,
                engineFrame
            ))
            : 0;
        const dirX = Number(entity.state?.dirX);
        const dirY = Number(entity.state?.dirY);
        if (dirX < 0)
            renderDirectionRow = 1;
        else if (dirX > 0)
            renderDirectionRow = 2;
        else if (dirY < 0)
            renderDirectionRow = 3;
        else
            renderDirectionRow = 0;
    }
    else if (isMoving)
    {
        sprite = walkingRobotSprite;
        columns = SOURCE_GRID_1254_COLUMNS;
        rows = SOURCE_GRID_1254_ROWS;
        anchorXs = WALKING_ROBOT_WALK_ANCHOR_X;
        anchorYs = WALKING_ROBOT_WALK_ANCHOR_Y;
        frame = Math.floor(now / WALKING_ROBOT_FRAME_DURATION_MS) %
            WALKING_ROBOT_FRAME_COUNT;
    }

    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;
    const source = getSpriteSource({
        columns,
        rows,
        frame,
        directionRow: renderDirectionRow,
        anchorXs,
        anchorYs,
    });
    const spriteSize = tilePixels * 1.7;
    const centerX = screen.x;
    const centerY = screen.y;

    if (isCharging && frame >= 1 && frame <= 2)
    {
        const dirX = Number(entity.state?.dirX) || 0;
        const dirY = Number(entity.state?.dirY) || 0;

        for (const afterimage of WALKING_ROBOT_AFTERIMAGES)
        {
            const ghostCenterX =
                centerX - dirX * tilePixels * afterimage.distance;
            const ghostCenterY =
                centerY - dirY * tilePixels * afterimage.distance;

            context.save();
            context.globalAlpha = afterimage.opacity;
            context.drawImage(
                sprite,
                source.x,
                source.y,
                source.width,
                source.height,
                ghostCenterX - source.anchorX * spriteSize,
                ghostCenterY - source.anchorY * spriteSize,
                spriteSize,
                spriteSize,
            );
            context.restore();
        }
    }

    context.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        centerX - source.anchorX * spriteSize,
        centerY - source.anchorY * spriteSize,
        spriteSize,
        spriteSize,
    );
    return true;
}

function drawShootingRobotSprite({
    context,
    entity,
    screen,
    tilePixels,
    now,
    directionRow,
}) {
    const isShooting = entity.state?.action === 'shoot';
    const isMoving =
        !isShooting &&
        (entity.velX !== 0 || entity.velY !== 0);

    let sprite = shootingRobotIdleSprite;
    let columns = SHOOTING_ROBOT_IDLE_COLUMNS;
    let rows = SHOOTING_ROBOT_IDLE_ROWS;
    let anchorXs = SHOOTING_ROBOT_IDLE_ANCHOR_X;
    let anchorYs = SHOOTING_ROBOT_IDLE_ANCHOR_Y;
    let frame = Math.floor(
        now / SHOOTING_ROBOT_IDLE_FRAME_DURATION_MS
    ) % SHOOTING_ROBOT_FRAME_COUNT;

    let renderDirectionRow = directionRow;

    const stateDirX = Number(entity.state?.dirX);
    const stateDirY = Number(entity.state?.dirY);

    if (stateDirX < 0)
        renderDirectionRow = 1;
    else if (stateDirX > 0)
        renderDirectionRow = 2;
    else if (stateDirY < 0)
        renderDirectionRow = 3;
    else if (stateDirY > 0)
        renderDirectionRow = 0;

    if (isShooting)
    {
        sprite = shootingRobotAttackSprite;
        columns = SHOOTING_ROBOT_ATTACK_COLUMNS;
        rows = SHOOTING_ROBOT_ATTACK_ROWS;
        anchorXs = SHOOTING_ROBOT_ATTACK_ANCHOR_X;
        anchorYs = SHOOTING_ROBOT_ATTACK_ANCHOR_Y;

        const engineFrame = Number(entity.state?.shootFrame);

        frame = Number.isInteger(engineFrame)
            ? Math.max(
                0,
                Math.min(
                    SHOOTING_ROBOT_FRAME_COUNT - 1,
                    engineFrame
                )
            )
            : 0;
    }
    else if (isMoving)
    {
        sprite = shootingRobotSprite;
        columns = SHOOTING_ROBOT_WALK_COLUMNS;
        rows = SHOOTING_ROBOT_WALK_ROWS;
        anchorXs = SHOOTING_ROBOT_WALK_ANCHOR_X;
        anchorYs = SHOOTING_ROBOT_WALK_ANCHOR_Y;

        frame = Math.floor(
            now / SHOOTING_ROBOT_FRAME_DURATION_MS
        ) % SHOOTING_ROBOT_FRAME_COUNT;
    }

    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;

    const source = getSpriteSource({
        columns,
        rows,
        frame,
        directionRow: renderDirectionRow,
        anchorXs,
        anchorYs,
    });

    let spriteHeight = tilePixels * 1.6;

    if (isShooting && renderDirectionRow === 3)
        spriteHeight = tilePixels * 1.9;

    const spriteWidth =
        spriteHeight *
        source.width /
        source.height;

    const centerX = screen.x;
    const centerY = screen.y;

    context.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        centerX - source.anchorX * spriteWidth,
        centerY - source.anchorY * spriteHeight,
        spriteWidth,
        spriteHeight,
    );

    return true;
}

function drawTankRobotSprite({context, screen, tilePixels, now, directionRow})
{
    if (!tankRobotIdleSprite.complete || tankRobotIdleSprite.naturalWidth === 0)
        return false;
    const frame = Math.floor(now / TANK_ROBOT_FRAME_DURATION_MS) % TANK_ROBOT_FRAME_COUNT;
    const sourceColumn = TANK_ROBOT_SOURCE_COLUMNS[frame] ?? TANK_ROBOT_SOURCE_COLUMNS[0];
    const sourceRow = TANK_ROBOT_SOURCE_ROWS[directionRow] ?? TANK_ROBOT_SOURCE_ROWS[0];
    const sourceX = sourceColumn.x;
    const sourceY = sourceRow.y;
    const sourceWidth = sourceColumn.width;
    const sourceHeight = sourceRow.height;
    const spriteSize = tilePixels * 2.1;
    const centerX = screen.x;
    const centerY = screen.y;
    context.drawImage(
        tankRobotIdleSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        centerX - spriteSize / 2,
        centerY - spriteSize / 2,
        spriteSize,
        spriteSize
    );
    return true;
}

function drawLordGoobSprite({context, screen, tilePixels, now, directionRow})
{
    if (!lordGoobIdleSprite.complete || lordGoobIdleSprite.naturalWidth === 0)
        return false;
    const frame = Math.floor(now / LORD_GOOB_FRAME_DURATION_MS) % LORD_GOOB_FRAME_COUNT;
    const source = getSpriteSource({
        columns: LORD_GOOB_SOURCE_COLUMNS,
        rows: LORD_GOOB_SOURCE_ROWS,
        frame,
        directionRow,
        anchorXs: LORD_GOOB_IDLE_ANCHOR_X,
    });
    const spriteSize = tilePixels * 2.8;
    const centerX = screen.x;
    const centerY = screen.y;
    context.drawImage(
        lordGoobIdleSprite,
        source.x,
        source.y,
        source.width,
        source.height,
        centerX - source.anchorX * spriteSize,
        centerY - spriteSize / 2,
        spriteSize,
        spriteSize
    );
    return true;
}

function drawEntity({context, entity, position, camera, now, attack, directionRow = 0})
{
    const type = getEntityType(entity);
    const screen = worldToScreen(position, camera);
    const tilePixels = camera.tileSize * camera.scale;
    const entityPixels = Math.max(8, Math.min(48, tilePixels));

    const margin = tilePixels * 3;

    if (screen.x < -margin || screen.y < -margin || screen.x > context.canvas.width + margin || screen.y > context.canvas.height + margin)
        return;

    context.save();

    switch (type) {
        case ENTITY_TYPE.WALL:
            context.fillStyle = '#334155';
            context.strokeStyle = '#64748b';
            context.lineWidth = 1;
            context.fillRect(
                screen.x - tilePixels / 2,
                screen.y - tilePixels / 2,
                tilePixels,
                tilePixels
            );
            context.strokeRect(
                screen.x - tilePixels / 2,
                screen.y - tilePixels / 2,
                tilePixels,
                tilePixels
            );
            break;

        case ENTITY_TYPE.PLAYER:
            if (drawPlayerAttackSprite({context, screen, tilePixels, now, attack, directionRow}))
                break;
            if (drawPlayerWalkSprite({context, entity, screen, tilePixels, now, directionRow}))
                break;
            context.shadowColor = '#22c55e';
            context.shadowBlur = 12;
            context.fillStyle = '#22c55e';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.34,
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.WALKING_ROBOT:
            if (drawWalkingRobotSprite({context, entity, screen, tilePixels, now, directionRow}))
            {
                break;
            }
            context.fillStyle = '#ef4444';
            context.fillRect(
                screen.x - entityPixels * 0.3,
                screen.y - entityPixels * 0.3,
                entityPixels * 0.6,
                entityPixels * 0.6
            );
            break;

        case ENTITY_TYPE.SHOOTING_ROBOT:
            if (drawShootingRobotSprite({context, entity, screen, tilePixels, now, directionRow}))
            {
                break;
            }
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.38,
                '#f97316'
            );
            break;

        case ENTITY_TYPE.TANK_ROBOT:
            if (drawTankRobotSprite({context, screen, tilePixels, now, directionRow}))
            {
                break;
            }
            context.fillStyle = '#eab308';
            context.strokeStyle = '#fef08a';
            context.lineWidth = 3;
            context.fillRect(
                screen.x - entityPixels * 0.42,
                screen.y - entityPixels * 0.42,
                entityPixels * 0.84,
                entityPixels * 0.84
            );
            context.strokeRect(
                screen.x - entityPixels * 0.42,
                screen.y - entityPixels * 0.42,
                entityPixels * 0.84,
                entityPixels * 0.84
            );
            break;

        case ENTITY_TYPE.BOSS:
            if (drawLordGoobSprite({context, screen, tilePixels, now, directionRow}))
            {
                break;
            }
            context.shadowColor = '#d946ef';
            context.shadowBlur = 18;
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.8,
                '#a855f7'
            );
            break;

        case ENTITY_TYPE.LASER_SLASH:
            context.strokeStyle = '#fb7185';
            context.lineWidth = 5;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.6,
                -Math.PI * 0.75,
                Math.PI * 0.25
            );
            context.stroke();
            break;

        case ENTITY_TYPE.LASER_PROJECTILE:
            context.shadowColor = '#22d3ee';
            context.shadowBlur = 10;
            context.fillStyle = '#67e8f9';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                Math.max(3, entityPixels * 0.12),
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.ENEMY_PROJECTILE:
            context.shadowColor = '#ef4444';
            context.shadowBlur = 10;
            context.fillStyle = '#fb923c';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                Math.max(3, entityPixels * 0.14),
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.LASER_SHIELD:
            context.shadowColor = '#60a5fa';
            context.shadowBlur = 12;
            context.strokeStyle = '#93c5fd';
            context.lineWidth = 4;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.85,
                0,
                Math.PI * 2
            );
            context.stroke();
            break;

        case ENTITY_TYPE.BOSS_PROJECTILE:
            context.shadowColor = '#c084fc';
            context.shadowBlur = 12;
            context.fillStyle = '#d8b4fe';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                Math.max(4, entityPixels * 0.18),
                0,
                Math.PI * 2
            );
            context.fill();
            break;

        case ENTITY_TYPE.ENEMY_MELEE:
            break;

        case ENTITY_TYPE.CHECKPOINT:
            context.shadowColor = '#facc15';
            context.shadowBlur = 14;
            drawDiamond(
                context,
                screen.x,
                screen.y,
                entityPixels * 0.35,
                '#facc15'
            );
            break;

        case ENTITY_TYPE.SPAWN_POINT:
            context.strokeStyle = '#38bdf8';
            context.lineWidth = 3;
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.3,
                0,
                Math.PI * 2
            );
            context.stroke();
            break;

        default:
            context.fillStyle = '#94a3b8';
            context.beginPath();
            context.arc(
                screen.x,
                screen.y,
                entityPixels * 0.2,
                0,
                Math.PI * 2
            );
            context.fill();
    }

    context.restore();
}

function drawStaticMapEntities({context, gameMap, camera})
{
    if (!Array.isArray(gameMap?.entities))
        return;
    gameMap.entities.forEach(entity =>
    {
        if (!entity || !STATIC_MAP_ENTITY_TYPES.has(getEntityType(entity)) || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
            return;
        drawEntity({
            context,
            entity,
            position: {x: entity.posX, y: entity.posY},
            camera,
        });
    });
}

export function GameCanvas({currentPlayerId, gameMap, gameEntities, gamePlayerData, goldFeedbacks = [], socket})
{
    const canvasRef = useRef(null);
    const entityTracksRef = useRef(new Map());
    const playerAttackRef = useRef(new Map());
    const renderDataRef = useRef({
        currentPlayerId,
        gameMap,
        gamePlayerData,
    });
    const spectatorIndexRef = useRef(0);

    const width = CANVAS_WIDTH;
    const mapAspectRatio = gameMap?.width > 0 && gameMap?.height > 0 ? gameMap.height / gameMap.width : 0.5625;

    const height = Math.max(MIN_CANVAS_HEIGHT, Math.min(MAX_CANVAS_HEIGHT, Math.round(width * mapAspectRatio)));

    renderDataRef.current = {
        currentPlayerId,
        gameMap,
        gamePlayerData: Array.isArray(gamePlayerData) ? gamePlayerData : [],
        goldFeedbacks: Array.isArray(goldFeedbacks) ? goldFeedbacks : [],
    };

    useEffect(() =>
    {
        function handleKeyDown(event)
        {
            const players = renderDataRef.current.gamePlayerData;
            const myPlayer = players.find(p => String(p.playerId) === String(currentPlayerId));
            if (myPlayer && myPlayer.alive === false)
            {
                const alivePlayers = players.filter(p => p.alive === true);

                if (alivePlayers.length > 0)
                {
                    if (event.key === 'd' || event.key === 'D')
                    {
                        spectatorIndexRef.current += 1;
                        if (alivePlayers.length <= spectatorIndexRef.current)
                            spectatorIndexRef.current = 0;
                    }
                    if (event.key === 'a' || event.key === 'A')
                    {
                        spectatorIndexRef.current -= 1;
                        if (spectatorIndexRef.current < 0)
                            spectatorIndexRef.current = alivePlayers.length - 1;
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () =>
        {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPlayerId]);
    useEffect(() =>
    {
        if (!socket)
            return undefined;
        function handlePlayerInput(payload)
        {
            const action = payload?.input?.action;
            if (typeof payload?.playerId === 'undefined' || (action !== PLAYER_ACTION.MELEE && action !== PLAYER_ACTION.RANGED))
                return;
            playerAttackRef.current.set(String(payload.playerId), {action, startedAt: performance.now()});
        }
        socket.on('player:input', handlePlayerInput);
        return () =>
        {
            socket.off('player:input', handlePlayerInput);
            playerAttackRef.current.clear();
        };
    }, [socket]);

    useEffect(() =>
    {
        if (!Array.isArray(gameEntities))
            return;

        const now = performance.now();
        const receivedEntityIds = new Set();
        const teleportDistance = gameMap?.scale > 0 ? gameMap.scale * 3 : 150;

        gameEntities.forEach(entity =>
        {
            if (!entity || typeof entity.entityId !== 'number' || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
                return;

            receivedEntityIds.add(entity.entityId);

            const previousTrack = entityTracksRef.current.get(entity.entityId);

            if (previousTrack && previousTrack.targetX === entity.posX && previousTrack.targetY === entity.posY)
            {
                previousTrack.directionRow = getPlayerDirectionRow(entity, previousTrack.directionRow);
                previousTrack.entity = entity;
                return;
            }

            const currentPosition = previousTrack ? getInterpolatedPosition(previousTrack, now) : {x: entity.posX, y: entity.posY};

            const distance = Math.hypot(entity.posX - currentPosition.x, entity.posY - currentPosition.y);

            const mustTeleport = !previousTrack || distance >= teleportDistance;
            const directionRow = getPlayerDirectionRow(entity, previousTrack?.directionRow ?? 0);
            const duration = mustTeleport ? 0 : INTERPOLATION_DURATION_MS;

            entityTracksRef.current.set(entity.entityId, {
                entity,
                directionRow,
                fromX: mustTeleport ? entity.posX : currentPosition.x,
                fromY: mustTeleport ? entity.posY : currentPosition.y,
                targetX: entity.posX,
                targetY: entity.posY,
                startedAt: now,
                duration,
            });
        });
        entityTracksRef.current.forEach((track, entityId) =>
        {
            if (!receivedEntityIds.has(entityId))
                entityTracksRef.current.delete(entityId);
        });
    }, [gameEntities, gameMap?.scale]);

    useEffect(() =>
    {
        let animationFrameId;
        function render(now)
        {
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const rect = canvas.getBoundingClientRect();
            const nextWidth = Math.max(1, Math.round(rect.width));
            const nextHeight = Math.max(1, Math.round(rect.height));
            if (canvas.width !== nextWidth || canvas.height !== nextHeight)
            {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }
            const context = canvas.getContext('2d');
            const renderData = renderDataRef.current;
            const localPlayer = renderData.gamePlayerData.find(player => String(player.playerId) === String(renderData.currentPlayerId));
            let localEntityId = localPlayer?.playerEntityId;
            if (typeof localEntityId !== 'number')
            {
                for (const track of entityTracksRef.current.values())
                {
                    if (getEntityType(track.entity) === ENTITY_TYPE.PLAYER)
                    {
                        localEntityId = track.entity.entityId;
                        break;
                    }
                }
            }
            const focusPosition = getFocusPosition({
                tracks: entityTracksRef.current,
                playerData: renderData.gamePlayerData,
                currentPlayerId: renderData.currentPlayerId,
                now,
                gameMap: renderData.gameMap,
                spectatorIndex: spectatorIndexRef.current,
            });
            const camera = getCamera({
                canvas,
                gameMap: renderData.gameMap,
                focusPosition,
            });
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#020617';
            context.fillRect(0, 0, canvas.width, canvas.height);
            drawGrid(context, canvas, camera);
            drawStaticMapEntities({
                context,
                gameMap: renderData.gameMap,
                camera,
            });
            entityTracksRef.current.forEach(track =>
            {
                const playerData = renderData.gamePlayerData.find(player => String(player.playerEntityId) === String(track.entity.entityId));
                const playerId = playerData?.playerId ?? (track.entity.entityId === localEntityId ? renderData.currentPlayerId : null);
                let attack = playerId === null ? null : playerAttackRef.current.get(String(playerId));
                if (attack && now - attack.startedAt >= getPlayerAttackDuration(attack.action))
                {
                    playerAttackRef.current.delete(String(playerId));
                    attack = null;
                }
                const position = getInterpolatedPosition(track, now);
                const entityType = getEntityType(track.entity);
                const facesPlayer = entityType === ENTITY_TYPE.TANK_ROBOT || entityType === ENTITY_TYPE.BOSS;
                const renderDirectionRow = facesPlayer ? getDirectionRowToward(position, focusPosition, track.directionRow) : track.directionRow;
                drawEntity({
                    context,
                    entity: track.entity,
                    position,
                    camera,
                    now,
                    attack,
                    directionRow: renderDirectionRow,
                });
            });
            drawGoldFeedbacks({context, tracks: entityTracksRef.current, feedbacks: renderData.goldFeedbacks, camera, now});
            const myPlayer = renderData.gamePlayerData.find(p => String(p.playerId) === String(renderData.currentPlayerId));
            if (myPlayer && myPlayer.alive === false)
            {
                context.fillStyle = 'red';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText("Death alive in: " + myPlayer.death_cooldowns, canvas.width / 2, canvas.height / 2);
            }
            animationFrameId = requestAnimationFrame(render);
        }
        animationFrameId = requestAnimationFrame(render);
        return () =>
        {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="game-canvas"
            width={width}
            height={height}
            aria-label="Live game state"
        />
    );
}
