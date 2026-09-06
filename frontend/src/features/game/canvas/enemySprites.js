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
    walkingRobotIdleSprite,
    walkingRobotSprite,
    walkingRobotChargeSprite,
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
    TANK_ROBOT_FRAME_COUNT,
    TANK_ROBOT_FRAME_DURATION_MS,
    TANK_ROBOT_SOURCE_COLUMNS,
    TANK_ROBOT_SOURCE_ROWS,
    TANK_ROBOT_FLY_COLUMNS,
    TANK_ROBOT_FLY_ROWS,
    TANK_ROBOT_FLY_FRAME_DURATION_MS,
    TANK_ROBOT_SLAM_COLUMNS,
    TANK_ROBOT_SLAM_ROWS,
    tankRobotIdleSprite,
    tankRobotFlySprite,
    tankRobotSlamSprite,
    LORD_GOOB_FRAME_COUNT,
    LORD_GOOB_FRAME_DURATION_MS,
    LORD_GOOB_SOURCE_COLUMNS,
    LORD_GOOB_SOURCE_ROWS,
    LORD_GOOB_IDLE_ANCHOR_X,
    LORD_GOOB_PHASE_TWO_FRAME_COUNT,
    LORD_GOOB_PHASE_TWO_COLUMNS,
    LORD_GOOB_PHASE_TWO_ROWS,
    LORD_GOOB_PHASE_TWO_ANCHOR_Y,
    LORD_GOOB_PHASE_TWO_SIZE_BY_ROW,
    LORD_GOOB_PHASE_THREE_FRAME_COUNT,
    LORD_GOOB_PHASE_THREE_COLUMNS,
    LORD_GOOB_PHASE_THREE_ROWS,
    LORD_GOOB_PHASE_THREE_ANCHOR_Y,
    LORD_GOOB_PHASE_THREE_SIZE_BY_ROW,
    lordGoobIdleSprite,
    lordGoobPhaseOneSprite,
    lordGoobPhaseTwoSprite,
    lordGoobPhaseThreeSprite,
} from './spriteAssets';
import { getSpriteSource } from './spriteUtils';

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

export function drawTankSlamWave({
    context,
    screen,
    tilePixels,
    slamFrame,
})
{
    const maxRadius = tilePixels * 2;
    context.save();
    context.translate(screen.x, screen.y);
    if (slamFrame === 0)
    {
        context.strokeStyle = 'rgba(251, 146, 60, 0.35)';
        context.lineWidth = 2;
        context.setLineDash([6, 6]);
        context.beginPath();
        context.arc(
            0,
            0,
            maxRadius,
            0,
            Math.PI * 2
        );
        context.stroke();
    }
    else if (slamFrame === 1)
    {
        context.fillStyle = 'rgba(249, 115, 22, 0.16)';
        context.strokeStyle = 'rgba(251, 146, 60, 0.65)';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(
            0,
            0,
            maxRadius,
            0,
            Math.PI * 2
        );
        context.fill();
        context.stroke();
    }
    else if (slamFrame === 2)
    {
        context.shadowColor = '#fb923c';
        context.shadowBlur = 18;
        context.strokeStyle = '#fdba74';
        context.lineWidth = 6;
        context.beginPath();
        context.arc(
            0,
            0,
            maxRadius,
            0,
            Math.PI * 2
        );
        context.stroke();
        context.strokeStyle = 'rgba(239, 68, 68, 0.70)';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(
            0,
            0,
            maxRadius * 0.55,
            0,
            Math.PI * 2
        );
        context.stroke();
    }
    else if (slamFrame === 3)
    {
        context.strokeStyle = 'rgba(251, 146, 60, 0.30)';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(
            0,
            0,
            maxRadius * 1.08,
            0,
            Math.PI * 2
        );
        context.stroke();
    }
    context.restore();
}

export function drawTankRobotSprite({
    context,
    entity,
    screen,
    tilePixels,
    now,
    directionRow,
})
{
    const isSlamming = entity.state?.action === 'slam';
    const isFlying =
        !isSlamming && (
            entity.velX !== 0 ||
            entity.velY !== 0
        );
    const slamFrameValue = Number(entity.state?.slamFrame);
    let slamFrame = 0;
    if (Number.isInteger(slamFrameValue))
    {
        slamFrame = Math.max(0, Math.min(TANK_ROBOT_FRAME_COUNT - 1, slamFrameValue));
    }
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
    let sprite = tankRobotIdleSprite;
    if (isSlamming)
    {
        sprite = tankRobotSlamSprite;
    }
    else if (isFlying)
    {
        sprite = tankRobotFlySprite;
    }
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;
    let columns = TANK_ROBOT_SOURCE_COLUMNS;
    let rows = TANK_ROBOT_SOURCE_ROWS;
    if (isSlamming)
    {
        columns = TANK_ROBOT_SLAM_COLUMNS;
        rows = TANK_ROBOT_SLAM_ROWS;
    }
    else if (isFlying)
    {
        columns = TANK_ROBOT_FLY_COLUMNS;
        rows = TANK_ROBOT_FLY_ROWS;
    }
    let frameDuration = TANK_ROBOT_FRAME_DURATION_MS;
    if (isFlying)
    {
        frameDuration = TANK_ROBOT_FLY_FRAME_DURATION_MS;
    }
    let frame = Math.floor(now / frameDuration) % TANK_ROBOT_FRAME_COUNT;
    if (isSlamming)
    {
        frame = slamFrame;
    }
    const sourceColumn =
        columns[frame] ??
        columns[0];
    const sourceRow =
        rows[renderDirectionRow] ??
        rows[0];
    const spriteSize = tilePixels * 2.1;
    const referenceCellSize = 313;
    let renderWidth = spriteSize;
    let renderHeight = spriteSize;
    if (isFlying)
    {
        renderWidth = spriteSize * sourceColumn.width / referenceCellSize;
        renderHeight = spriteSize * sourceRow.height / referenceCellSize;
    }
    const centerX = screen.x;
    const centerY = screen.y;
    let anchorY = 0.5;
    if (isFlying)
    {
        anchorY = 0.43;
    }
    if (isSlamming)
    {
        drawTankSlamWave({
            context,
            screen,
            tilePixels,
            slamFrame,
        });
    }
    context.drawImage(
        sprite,
        sourceColumn.x,
        sourceRow.y,
        sourceColumn.width,
        sourceRow.height,
        centerX - renderWidth / 2,
        centerY - renderHeight * anchorY,
        renderWidth,
        renderHeight
    );
    return true;
}

export function drawLordGoobSprite({ context, entity, screen, tilePixels, now, directionRow })
{
    const isAttacking = entity.state?.action === 'attack';
    let attackType = 'idle';
    if (isAttacking)
    {
        attackType = entity.state?.attackType;
    }
    const useMagicAnimation = attackType === 'magicFan' || attackType === 'radial';
    const useCannonAnimation = attackType === 'cannonFan';
    const useLaserAnimation = attackType === 'laser';
    let sprite = lordGoobIdleSprite;
    if (useLaserAnimation)
    {
        sprite = lordGoobPhaseThreeSprite;
    }
    else if (useCannonAnimation)
    {
        sprite = lordGoobPhaseTwoSprite;
    }
    else if (useMagicAnimation)
    {
        sprite = lordGoobPhaseOneSprite;
    }
    if (!sprite.complete || sprite.naturalWidth === 0)
        return false;
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
    let frame;
    let columns;
    let rows;
    let anchorXs = null;
    let anchorYs = null;
    let spriteSize;
    if (useLaserAnimation)
    {
        const engineFrame = Number(entity.state?.attackFrame);
        if (Number.isInteger(engineFrame))
        {
            frame = Math.max(0, Math.min(LORD_GOOB_PHASE_THREE_FRAME_COUNT - 1, engineFrame));
        }
        else
        {
            frame = 0;
        }
        columns = LORD_GOOB_PHASE_THREE_COLUMNS;
        rows = LORD_GOOB_PHASE_THREE_ROWS;
        anchorYs = LORD_GOOB_PHASE_THREE_ANCHOR_Y;
        spriteSize = tilePixels * LORD_GOOB_PHASE_THREE_SIZE_BY_ROW[renderDirectionRow];
    }
    else if (useCannonAnimation)
    {
        const engineFrame = Number(entity.state?.attackFrame);
        if (Number.isInteger(engineFrame))
        {
            frame = Math.max(0, Math.min(LORD_GOOB_PHASE_TWO_FRAME_COUNT - 1, engineFrame));
        }
        else
        {
            frame = 0;
        }
        columns = LORD_GOOB_PHASE_TWO_COLUMNS;
        rows = LORD_GOOB_PHASE_TWO_ROWS;
        anchorYs = LORD_GOOB_PHASE_TWO_ANCHOR_Y;
        spriteSize = tilePixels * LORD_GOOB_PHASE_TWO_SIZE_BY_ROW[renderDirectionRow];
    }
    else if (useMagicAnimation)
    {
        const engineFrame = Number(entity.state?.attackFrame);
        if (Number.isInteger(engineFrame))
        {
            frame = Math.max(0, Math.min(LORD_GOOB_FRAME_COUNT - 1, engineFrame));
        }
        else
        {
            frame = 0;
        }
        columns = SOURCE_GRID_1254_COLUMNS;
        rows = SOURCE_GRID_1254_ROWS;
        spriteSize = tilePixels * 3.7;
    }
    else
    {
        frame = Math.floor(now / LORD_GOOB_FRAME_DURATION_MS) % LORD_GOOB_FRAME_COUNT;
        columns = LORD_GOOB_SOURCE_COLUMNS;
        rows = LORD_GOOB_SOURCE_ROWS;
        anchorXs = LORD_GOOB_IDLE_ANCHOR_X;
        spriteSize = tilePixels * 2.8;
    }
    const source = getSpriteSource({
        columns,
        rows,
        frame,
        directionRow: renderDirectionRow,
        anchorXs,
        anchorYs,
    });
    const centerX = screen.x;
    const centerY = screen.y;
    const renderHeight = spriteSize;
    let renderWidth = spriteSize;
    if (useLaserAnimation)
    {
        renderWidth = renderHeight * source.width / source.height;
    }
    context.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        centerX - source.anchorX * renderWidth,
        centerY - source.anchorY * renderHeight,
        renderWidth,
        renderHeight
    );
    return true;
}
