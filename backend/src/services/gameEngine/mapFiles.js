const fs = require('fs/promises');
const path = require('path');

async function writeMapFile(mapDirectory, mapPayload)
{
    if (
        !mapPayload ||
        typeof mapPayload !== 'object' ||
        Array.isArray(mapPayload) ||
        typeof mapPayload.roomId !== 'string' ||
        !Array.isArray(mapPayload.entities)
    )
    {
        throw new TypeError('Invalid map payload');
    }
    await fs.mkdir(mapDirectory, { recursive: true });
    const safeRoomId = Buffer.from(mapPayload.roomId, 'utf8').toString('hex');
    const filePath = path.join(mapDirectory, `${safeRoomId}.json`);
    const temporaryPath = path.join(
        mapDirectory,
        `${safeRoomId}.${process.pid}.${Date.now()}.tmp`
    );
    const serializedPayload = JSON.stringify({
        roomId: mapPayload.roomId,
        width: mapPayload.width,
        height: mapPayload.height,
        scale: mapPayload.scale,
        spawnX: mapPayload.spawnX,
        spawnY: mapPayload.spawnY,
        entities: mapPayload.entities,
    });
    try
    {
        await fs.writeFile(temporaryPath, serializedPayload, {
            encoding: 'utf8',
            flag: 'wx',
        });
        await fs.rename(temporaryPath, filePath);
    }
    catch (error)
    {
        try
        {
            await fs.unlink(temporaryPath);
        }
        catch (cleanupError)
        {
            if (cleanupError.code !== 'ENOENT')
            {
                console.error(`Unable to remove temporary map file ${temporaryPath};`, cleanupError);
            }
        }
        throw error;
    }
    return filePath;
}

async function removeMapFile(filePath)
{
    if (typeof filePath !== 'string' || filePath.length === 0)
        return;
    try
    {
        await fs.unlink(filePath);
    }
    catch (error)
    {
        if (error.code !== 'ENOENT')
        {
            console.error(`Unable to remove engine map file ${filePath}:`, error);
        }
    }
}

// n is the number of players in the room
async function pickRandomMapFile(n)
{
    if (n <= 0 || n > 4)
        return;
    const mapsDir = path.join(__dirname, '../../game/maps');
    try
    {
        await fs.access(mapsDir);
    }
    catch
    {
        throw new Error(`No such dir found: ${mapsDir}`);
    }
    const files = await fs.readdir(mapsDir);
    const maps = files
        .filter((file) => /^(\d+)_map_.*\.txt$/.test(file))
        .sort((a, b) =>
        {
            const na = parseInt(a.match(/^(\d+)_/)[1]);
            const nb = parseInt(b.match(/^(\d+)_/)[1]);
            return (na - nb);
        });
    if (maps.length === 0)
        throw new Error(`No map files found in ${mapsDir}`);
    let mapSize;
    if (n === 1)
    {
        mapSize = 50;
    }
    else if (n === 2)
    {
        mapSize = 100;
    }
    else
    {
        mapSize = 200;
    }
    const selectedMap = maps.find((file) => new RegExp(`_${mapSize}_${mapSize}\\.txt$`).test(file));
    if (!selectedMap)
        throw new Error(`No ${mapSize}x${mapSize} map file found in ${mapsDir}`);
    console.log(path.join(mapsDir, selectedMap));
    return path.join(mapsDir, selectedMap);
}

module.exports = {
    writeMapFile,
    removeMapFile,
    pickRandomMapFile,
};
