import {
    WALKING_ROBOT_FRAME_COUNT,
    WALKING_ROBOT_IDLE_FRAME_DURATION_MS,
    WALKING_ROBOT_FRAME_DURATION_MS,
    WALKING_ROBOT_IDLE_COLUMNS,
    WALKING_ROBOT_IDLE_ROWS,
    WALKING_ROBOT_IDLE_ANCHOR_X,
    WALKING_ROBOT_IDLE_ANCHOR_Y,
    WALKING_ROBOT_WALK_ANCHOR_X,
    WALKING_ROBOT_WALK_ANCHOR_Y,
    WALKING_ROBOT_CHARGE_ANCHOR_X,
    WALKING_ROBOT_CHARGE_ANCHOR_Y,
    WALKING_ROBOT_AFTERIMAGES,
    SOURCE_GRID_1254_COLUMNS,
    SOURCE_GRID_1254_ROWS,
    WALKING_ROBOT_WALK_ROWS,
    walkingRobotIdleSprite,
    walkingRobotSprite,
    walkingRobotChargeSprite,
} from '../spriteAssets';
import { getSpriteSource } from '../spriteUtils';

export function drawWalkingRobotSprite({
    context,
    entity,
    screen,
    tilePixels,
    now,
    directionRow,
})
{
    const isCharging = entity.state?.action === 'charge';
    const velocityX = Number(entity.velX) || 0;
    const velocityY = Number(entity.velY) || 0;
    const isMoving = !isCharging && (velocityX !== 0 || velocityY !== 0);
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
        if (Number.isInteger(engineFrame))
        {
            frame = Math.max(0, Math.min(WALKING_ROBOT_FRAME_COUNT - 1, engineFrame));
        }
        else
        {
            frame = 0;
        }
        const dirX = Number(entity.state?.dirX);
        const dirY = Number(entity.state?.dirY);
        if (dirX < 0)
        {
            renderDirectionRow = 1;
        }
        else if (dirX > 0)
        {
            renderDirectionRow = 2;
        }
        else if (dirY < 0)
        {
            renderDirectionRow = 3;
        }
        else
        {
            renderDirectionRow = 0;
        }
    }
    else if (isMoving)
    {
        sprite = walkingRobotSprite;
        columns = SOURCE_GRID_1254_COLUMNS;
        rows = WALKING_ROBOT_WALK_ROWS;
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
