import { SHIELD_BREAK_DURATION_MS } from './spriteAssets';
import { getInterpolatedPosition, worldToScreen } from './cameraUtils';

export function drawGoldFeedbacks({context, tracks, feedbacks, camera, now})
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
        let sign = '-';
        let color = '#ef4444';
        if (feedback.type === 'gain')
        {
            sign = '+';
            color = '#facc15';
        }
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

export function drawGrid(context, canvas, camera)
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

export function drawDiamond(context, x, y, radius, color)
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

export function drawHealthBar({context, screen, entity, tilePixels, maxHealthRef})
{
    const health = Number(entity.health);
    if (!Number.isFinite(health))
        return;
    const entityId = entity.entityId ?? entity.id;
    if (!maxHealthRef.current.has(entityId))
        maxHealthRef.current.set(entityId, health);
    const maxHealth = maxHealthRef.current.get(entityId);
    const ratio = Math.max(0, Math.min(1, health / maxHealth));
    const width = tilePixels * 0.9;
    const height = 5;
    const x = screen.x - width / 2;
    const y = screen.y - tilePixels * 0.72;

    context.fillStyle = 'rgba(15, 20, 42, 0.9)';
    context.fillRect(x, y, width, height);
    if (ratio > 0.85)
        context.fillStyle = "#22c55e";
    else if (ratio > 0.66)
        context.fillStyle = "#eab308";
    else if (ratio > 0.33)
        context.fillStyle = "#f97316";
    else
        context.fillStyle = "#ef4444";
    context.fillRect(x, y, width * ratio, height);
}

export function drawShieldBreakEffects({context, effects, camera, now})
{
    effects.forEach((effect, entityId) =>
    {
        const elapsed = now - effect.startedAt;
        if (elapsed >= SHIELD_BREAK_DURATION_MS)
        {
            effects.delete(entityId);
            return;
        }
        const progress = elapsed / SHIELD_BREAK_DURATION_MS;
        const screen = worldToScreen(
            {x: effect.posX, y: effect.posY},
            camera
        );
        const tilePixels = camera.tileSize * camera.scale;
        const radius = tilePixels * (0.85 + progress * 0.75);
        const opacity = 1 - progress;

        context.save();

        context.globalAlpha = opacity;
        context.strokeStyle = '#93c5fd';
        context.shadowColor = '#60a5fa';
        context.shadowBlur = 18;
        context.lineWidth = Math.max(1, 5 * opacity);

        context.beginPath();
        context.arc(
            screen.x,
            screen.y,
            radius,
            0,
            Math.PI * 2
        );
        context.stroke();

        context.strokeStyle = '#dbeafe';
        context.lineWidth = Math.max(1, 3 * opacity);

        for (let index = 0; index < 8; index += 1)
        {
            const angle = (Math.PI * 2 * index) / 8;
            const innerRadius = radius * 0.65;
            const outerRadius = radius * 1.15;

            context.beginPath();
            context.moveTo(
                screen.x + Math.cos(angle) * innerRadius,
                screen.y + Math.sin(angle) * innerRadius
            );
            context.lineTo(
                screen.x + Math.cos(angle) * outerRadius,
                screen.y + Math.sin(angle) * outerRadius
            );
            context.stroke();
        }
        context.restore();
    });
}
