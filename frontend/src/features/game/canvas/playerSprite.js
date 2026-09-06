import { PLAYER_ACTION } from '../gameProtocol';
import {
    PLAYER_ATTACK_FRAME_COUNT,
    PLAYER_MELEE_FRAME_DURATION_MS,
    PLAYER_RANGED_FRAME_DURATION_MS,
    PLAYER_WALK_FRAME_COUNT,
    PLAYER_WALK_FRAME_DURATION_MS,
    PLAYER_IDLE_FRAME_COUNT,
    PLAYER_IDLE_FRAME_DURATION_MS,
    PLAYER_SPRITE_TINTS,
    SOURCE_GRID_1254_COLUMNS,
    SOURCE_GRID_1254_ROWS,
    PLAYER_MELEE_ANCHOR_X,
    PLAYER_MELEE_ANCHOR_Y,
    PLAYER_RANGED_ANCHOR_X,
    PLAYER_RANGED_ANCHOR_Y,
    PLAYER_WALK_ANCHOR_X,
    PLAYER_WALK_ANCHOR_Y,
    PLAYER_IDLE_ANCHOR_X,
    PLAYER_IDLE_ANCHOR_Y,
    playerWalkSprite,
    playerIdleSprite,
    playerMeleeAttackSprite,
    playerRangedAttackSprite,
} from './spriteAssets';
import { getSpriteSource } from './spriteUtils';

export function getPlayerSpriteTint(playerEntityId, orderedPlayerIds)
{
    const playerIndex = orderedPlayerIds.indexOf(String(playerEntityId));
    if (playerIndex < 0)
        return PLAYER_SPRITE_TINTS[0];
    return PLAYER_SPRITE_TINTS[playerIndex % PLAYER_SPRITE_TINTS.length];
}

export function getPlayerAttackDuration(action)
{
    if (action === PLAYER_ACTION.MELEE)
        return PLAYER_ATTACK_FRAME_COUNT * PLAYER_MELEE_FRAME_DURATION_MS;
    if (action === PLAYER_ACTION.RANGED)
        return PLAYER_ATTACK_FRAME_COUNT * PLAYER_RANGED_FRAME_DURATION_MS;
    return 0;
}

const playerTintFrameCache = new Map();

export function drawPlayerSpriteImage({
    context,
    sprite,
    source,
    destinationX,
    destinationY,
    spriteSize,
    tint,
})
{
    if (!tint)
    {
        context.drawImage(
            sprite,
            source.x,
            source.y,
            source.width,
            source.height,
            destinationX,
            destinationY,
            spriteSize,
            spriteSize
        );
        return;
    }

    const renderSize = Math.max(1, Math.round(spriteSize));
    const cacheKey = [
        sprite.src,
        source.x,
        source.y,
        source.width,
        source.height,
        renderSize,
        tint.id,
    ].join(':');

    let tintedFrame = playerTintFrameCache.get(cacheKey);

    if (!tintedFrame)
    {
        tintedFrame = document.createElement('canvas');
        tintedFrame.width = renderSize;
        tintedFrame.height = renderSize;

        const tintContext = tintedFrame.getContext(
            '2d',
            {willReadFrequently: true}
        );

        tintContext.drawImage(
            sprite,
            source.x,
            source.y,
            source.width,
            source.height,
            0,
            0,
            renderSize,
            renderSize
        );

        const imageData = tintContext.getImageData(
            0,
            0,
            renderSize,
            renderSize
        );

        const pixels = imageData.data;

        for (let index = 0; index < pixels.length; index += 4)
        {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const alpha = pixels[index + 3];

            if (alpha === 0)
                continue;

            const brightest = Math.max(red, green, blue);
            const darkest = Math.min(red, green, blue);
            const colorDifference = brightest - darkest;

            const isLightArmor =
                red >= 145 &&
                green >= 145 &&
                blue >= 145 &&
                colorDifference <= 55;

            if (!isLightArmor)
                continue;

            const shade = (red + green + blue) / (3 * 255);
            const strength = tint.strength;

            pixels[index] = Math.round(
                red * (1 - strength) +
                tint.red * shade * strength
            );
            pixels[index + 1] = Math.round(
                green * (1 - strength) +
                tint.green * shade * strength
            );
            pixels[index + 2] = Math.round(
                blue * (1 - strength) +
                tint.blue * shade * strength
            );
        }

        tintContext.putImageData(imageData, 0, 0);

        if (playerTintFrameCache.size >= 256)
            playerTintFrameCache.clear();
        playerTintFrameCache.set(cacheKey, tintedFrame);
    }
    context.drawImage(
        tintedFrame,
        destinationX,
        destinationY,
        spriteSize,
        spriteSize
    );
}

export function drawPlayerAttackSprite({context, screen, tilePixels, now, attack, directionRow = 0, playerSpriteTint = null})
{
    if (!attack)
        return false;

    const isMelee = attack.action === PLAYER_ACTION.MELEE;
    const isRanged = attack.action === PLAYER_ACTION.RANGED;
    if (!isMelee && !isRanged)
        return false;

    let sprite = playerRangedAttackSprite;
    if (isMelee)
        sprite = playerMeleeAttackSprite;
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;

    let frameDuration = PLAYER_RANGED_FRAME_DURATION_MS;
    if (isMelee)
        frameDuration = PLAYER_MELEE_FRAME_DURATION_MS;
    const elapsed = now - attack.startedAt;
    const duration = getPlayerAttackDuration(attack.action);
    if (elapsed < 0 || elapsed >= duration)
        return false;

    const frame = Math.min(PLAYER_ATTACK_FRAME_COUNT - 1, Math.floor(elapsed / frameDuration));
    let anchorXs = PLAYER_RANGED_ANCHOR_X;
    let anchorYs = PLAYER_RANGED_ANCHOR_Y;
    if (isMelee)
    {
        anchorXs = PLAYER_MELEE_ANCHOR_X;
        anchorYs = PLAYER_MELEE_ANCHOR_Y;
    }
    const source = getSpriteSource({
        columns: SOURCE_GRID_1254_COLUMNS,
        rows: SOURCE_GRID_1254_ROWS,
        frame,
        directionRow,
        anchorXs,
        anchorYs,
    });
    const spriteSize = tilePixels * 1.8;
    const centerX = screen.x;
    const centerY = screen.y;

    drawPlayerSpriteImage({
        context,
        sprite,
        source,
        destinationX: centerX - source.anchorX * spriteSize,
        destinationY: centerY - source.anchorY * spriteSize,
        spriteSize,
        tint: playerSpriteTint,
    });
    return true;
}

export function drawPlayerWalkSprite({context, entity, screen, tilePixels, now, directionRow = 0, playerSpriteTint = null})
{
    const isMoving = entity.velX !== 0 || entity.velY !== 0;
    let sprite = playerIdleSprite;
    let frameDuration = PLAYER_IDLE_FRAME_DURATION_MS;
    let frameCount = PLAYER_IDLE_FRAME_COUNT;
    let anchorXs = PLAYER_IDLE_ANCHOR_X;
    let anchorYs = PLAYER_IDLE_ANCHOR_Y;
    if (isMoving)
    {
        sprite = playerWalkSprite;
        frameDuration = PLAYER_WALK_FRAME_DURATION_MS;
        frameCount = PLAYER_WALK_FRAME_COUNT;
        anchorXs = PLAYER_WALK_ANCHOR_X;
        anchorYs = PLAYER_WALK_ANCHOR_Y;
    }
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;
    const frame = Math.floor(now / frameDuration) % frameCount;

    const source = getSpriteSource({
        columns: SOURCE_GRID_1254_COLUMNS,
        rows: SOURCE_GRID_1254_ROWS,
        frame,
        directionRow,
        anchorXs,
        anchorYs,
    });
    const spriteSize = tilePixels * 1.8;
    const centerX = screen.x;
    const centerY = screen.y;

    drawPlayerSpriteImage({
        context,
        sprite,
        source,
        destinationX: centerX - source.anchorX * spriteSize,
        destinationY: centerY - source.anchorY * spriteSize,
        spriteSize,
        tint: playerSpriteTint,
    });

    return true;
}
