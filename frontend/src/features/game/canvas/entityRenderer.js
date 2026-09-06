import { ENTITY_TYPE } from '../gameProtocol';
import { STATIC_MAP_ENTITY_TYPES, checkpointPlatformSprite } from './spriteAssets';
import { getEntityType } from './spriteUtils';
import { worldToScreen } from './cameraUtils';
import { drawDiamond, drawHealthBar } from './effects';
import { drawPlayerAttackSprite, drawPlayerWalkSprite } from './playerSprite';
import {
    drawWalkingRobotSprite,
    drawShootingRobotSprite,
    drawTankRobotSprite,
    drawLordGoobSprite,
} from './enemySprites';

export function drawEntity({ context, entity, position, camera, now, attack, directionRow = 0, playerSpriteTint = null, maxHealthRef })
{
    const type = getEntityType(entity);
    const screen = worldToScreen(position, camera);
    const tilePixels = camera.tileSize * camera.scale;
    const entityPixels = Math.max(8, Math.min(48, tilePixels));

    const margin = tilePixels * 3;

    if (screen.x < -margin || screen.y < -margin || screen.x > context.canvas.width + margin || screen.y > context.canvas.height + margin)
        return;

    context.save();

    switch (type)
    {
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
            if (drawPlayerAttackSprite({ context, screen, tilePixels, now, attack, directionRow, playerSpriteTint }))
            {
                break;
            }
            if (drawPlayerWalkSprite({ context, entity, screen, tilePixels, now, directionRow, playerSpriteTint }))
            {
                break;
            }
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
            if (drawWalkingRobotSprite({ context, entity, screen, tilePixels, now, directionRow }))
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
            if (drawShootingRobotSprite({ context, entity, screen, tilePixels, now, directionRow }))
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
            if (drawTankRobotSprite({ context, entity, screen, tilePixels, now, directionRow }))
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
            if (drawLordGoobSprite({ context, entity, screen, tilePixels, now, directionRow }))
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
                entityPixels * 1.10,
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

        case ENTITY_TYPE.BOSS_LASER_PROJECTILE:
        {
            const velocityX = Number(entity.velX) || 0;
            const velocityY = Number(entity.velY) || 0;
            const angle = Math.atan2(velocityY, velocityX);
            const laserLength = tilePixels * 1.8;
            const outerWidth = Math.max(10, tilePixels * 0.55);
            const innerWidth = Math.max(4, tilePixels * 0.20);
            context.translate(screen.x, screen.y);
            context.rotate(angle);
            context.lineCap = 'round';
            context.shadowColor = '#d946ef';
            context.shadowBlur = 24;
            context.strokeStyle = 'rgba(168, 85, 247, 0.75)';
            context.lineWidth = outerWidth;
            context.beginPath();
            context.moveTo(-laserLength / 2, 0);
            context.lineTo(laserLength / 2, 0);
            context.stroke();
            context.shadowColor = '#f0abfc';
            context.shadowBlur = 14;
            context.strokeStyle = '#f5d0fe';
            context.lineWidth = innerWidth;
            context.beginPath();
            context.moveTo(-laserLength / 2, 0);
            context.lineTo(laserLength / 2, 0);
            context.stroke();
            context.fillStyle = '#ffffff';
            context.beginPath();
            context.arc(
                laserLength / 2,
                0,
                Math.max(3, tilePixels * 0.10),
                0,
                Math.PI * 2
            );
            context.fill();
            break;
        }

        case ENTITY_TYPE.ENEMY_MELEE:
            break;

        case ENTITY_TYPE.CHECKPOINT:
        {
            if (!checkpointPlatformSprite.complete || checkpointPlatformSprite.naturalWidth === 0)
            {
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
            }
            const platformWidth = entityPixels * 2;
            const platformHeight = platformWidth* checkpointPlatformSprite.naturalHeight / checkpointPlatformSprite.naturalWidth;
            let animationTime = 0;
            if (Number.isFinite(now))
            {
                animationTime = now;
            }
            const pulse = (Math.sin(animationTime / 320) + 1) / 2;
            const ringCenterY = screen.y + platformHeight * 0.05;

            context.fillStyle = `rgba(34, 211, 238, ${0.08 + pulse * 0.10})`;
            context.shadowColor = '#22d3ee';
            context.shadowBlur = 10 + pulse * 10;
            context.beginPath();
            context.ellipse(
                screen.x,
                ringCenterY,
                platformWidth * 0.56,
                platformHeight * 0.38,
                0,
                0,
                Math.PI * 2
            );
            context.fill();
            context.shadowBlur = 0;
            context.drawImage(
                checkpointPlatformSprite,
                screen.x - platformWidth / 2,
                screen.y - platformHeight / 2,
                platformWidth,
                platformHeight
            );

            context.lineWidth = Math.max(1.5, tilePixels * 0.04);
            context.strokeStyle = `rgba(103, 232, 249, ${0.55 + pulse * 0.35})`;
            context.setLineDash([
                platformWidth * 0.10,
                platformWidth * 0.06,
            ]);
            context.lineDashOffset = -animationTime / 35;
            context.beginPath();
            context.ellipse(
                screen.x,
                ringCenterY,
                platformWidth * 0.58,
                platformHeight * 0.42,
                0,
                0,
                Math.PI * 2
            );
            context.stroke();
            context.strokeStyle = `rgba(165, 243, 252, ${0.45 + pulse * 0.30})`;
            context.setLineDash([
                platformWidth * 0.06,
                platformWidth * 0.05,
            ]);
            context.lineDashOffset = animationTime / 28;
            context.beginPath();
            context.ellipse(
                screen.x,
                ringCenterY,
                platformWidth * 0.43,
                platformHeight * 0.29,
                0,
                0,
                Math.PI * 2
            );
            context.stroke();

            context.setLineDash([]);
            break;
        }

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
    if (type === ENTITY_TYPE.PLAYER || type === ENTITY_TYPE.WALKING_ROBOT || type === ENTITY_TYPE.SHOOTING_ROBOT || type === ENTITY_TYPE.TANK_ROBOT || type === ENTITY_TYPE.BOSS)
    {
        drawHealthBar({ context, screen, entity, tilePixels, maxHealthRef });
    }
    context.restore();
}

export function drawStaticMapEntities({ context, gameMap, camera, now })
{
    if (!Array.isArray(gameMap?.entities))
        return;
    gameMap.entities.forEach((entity) =>
    {
        if (!entity || !STATIC_MAP_ENTITY_TYPES.has(getEntityType(entity)) || typeof entity.posX !== 'number' || typeof entity.posY !== 'number')
            return;
        drawEntity({
            context,
            entity,
            position: { x: entity.posX, y: entity.posY },
            camera,
            now,
        });
    });
}
