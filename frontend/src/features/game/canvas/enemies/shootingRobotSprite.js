import {
    SHOOTING_ROBOT_FRAME_COUNT,
    SHOOTING_ROBOT_FRAME_DURATION_MS,
    SHOOTING_ROBOT_IDLE_FRAME_DURATION_MS,
    SHOOTING_ROBOT_IDLE_COLUMNS,
    SHOOTING_ROBOT_IDLE_ROWS,
    SHOOTING_ROBOT_IDLE_ANCHOR_X,
    SHOOTING_ROBOT_IDLE_ANCHOR_Y,
    SHOOTING_ROBOT_WALK_COLUMNS,
    SHOOTING_ROBOT_WALK_ROWS,
    SHOOTING_ROBOT_WALK_ANCHOR_X,
    SHOOTING_ROBOT_WALK_ANCHOR_Y,
    SHOOTING_ROBOT_ATTACK_COLUMNS,
    SHOOTING_ROBOT_ATTACK_ROWS,
    SHOOTING_ROBOT_ATTACK_ANCHOR_X,
    SHOOTING_ROBOT_ATTACK_ANCHOR_Y,
    shootingRobotIdleSprite,
    shootingRobotSprite,
    shootingRobotAttackSprite,
} from '../spriteAssets';
import { getSpriteSource } from '../spriteUtils';

export function drawShootingRobotSprite({
    context,
    entity,
    screen,
    tilePixels,
    now,
    directionRow,
})
{
    const isShooting = entity.state?.action === 'shoot';
    const velocityX = Number(entity.velX) || 0;
    const velocityY = Number(entity.velY) || 0;
    const isMoving = !isShooting && (velocityX !== 0 || velocityY !== 0);
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
    {
        renderDirectionRow = 1;
    }
    else if (stateDirX > 0)
    {
        renderDirectionRow = 2;
    }
    else if (stateDirY < 0)
    {
        renderDirectionRow = 3;
    }
    else if (stateDirY > 0)
    {
        renderDirectionRow = 0;
    }

    if (isShooting)
    {
        sprite = shootingRobotAttackSprite;
        columns = SHOOTING_ROBOT_ATTACK_COLUMNS;
        rows = SHOOTING_ROBOT_ATTACK_ROWS;
        anchorXs = SHOOTING_ROBOT_ATTACK_ANCHOR_X;
        anchorYs = SHOOTING_ROBOT_ATTACK_ANCHOR_Y;

        const engineFrame = Number(entity.state?.shootFrame);

        if (Number.isInteger(engineFrame))
        {
            frame = Math.max(0, Math.min(SHOOTING_ROBOT_FRAME_COUNT - 1, engineFrame));
        }
        else
        {
            frame = 0;
        }
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
    {
        spriteHeight = tilePixels * 1.9;
    }

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
