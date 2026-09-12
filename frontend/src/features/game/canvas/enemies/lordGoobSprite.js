import {
    SOURCE_GRID_1254_COLUMNS,
    SOURCE_GRID_1254_ROWS,
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
} from '../spriteAssets';
import { getSpriteSource } from '../spriteUtils';

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
