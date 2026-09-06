export function getEntityType(entity)
{
    return entity.typeId ?? entity.entityTypeId;
}

export function getPlayerDirectionRow(entity, fallbackRow = 0)
{
    let velocityX = 0;
    if (typeof entity.velX === 'number')
    {
        velocityX = entity.velX;
    }
    let velocityY = 0;
    if (typeof entity.velY === 'number')
    {
        velocityY = entity.velY;
    }

    if (Math.abs(velocityX) > Math.abs(velocityY))
    {
        if (velocityX < 0)
            return 1;
        return 2;
    }

    if (Math.abs(velocityY) > 0)
    {
        if (velocityY < 0)
            return 3;
        return 0;
    }

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

export function getDirectionRowToward(sourcePosition, targetPosition, fallbackRow = 0)
{
    if (!sourcePosition || !targetPosition)
        return fallbackRow;
    const deltaX = targetPosition.x - sourcePosition.x;
    const deltaY = targetPosition.y - sourcePosition.y;
    if (deltaX === 0 && deltaY === 0)
        return fallbackRow;
    if (Math.abs(deltaX) > Math.abs(deltaY))
    {
        if (deltaX < 0)
            return 1;
        return 2;
    }
    if (deltaY < 0)
        return 3;
    return 0;
}


export function getSpriteSource({ columns, rows, frame, directionRow, anchorXs = null, anchorYs = null })
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
