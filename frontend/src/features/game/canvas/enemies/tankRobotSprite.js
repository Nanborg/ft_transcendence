import {
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
} from '../spriteAssets';

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
    const velocityX = Number(entity.velX) || 0;
    const velocityY = Number(entity.velY) || 0;
    const isFlying =
        !isSlamming && (
            velocityX !== 0 ||
            velocityY !== 0
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
