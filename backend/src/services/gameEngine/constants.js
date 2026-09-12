const DEFAULT_ENGINE_HOST = process.env.GAMEPLAY_HOST || 'gameplay-cpp';
const DEFAULT_ENGINE_PORT = Number(process.env.GAMEPLAY_PORT || 7297);
const DEFAULT_ENGINE_MAP_DIRECTORY = process.env.GAME_MAP_DIRECTORY || '/tmp/ft-transcendence-game-maps';
const DEFAULT_ROOM_READY_TIMEOUT_MS = Number(process.env.GAME_ROOM_READY_TIMEOUT_MS || 180000);

const ENGINE_INPUT_TYPE = Object.freeze({
    ROOM_CREATE: 0,
    ROOM_DESTROY: 1,
    ROOM_START: 2,
    ROOM_STOP: 3,

    PING: 100,
    SYNC: 101,

    JOIN: 110,
    LEAVE: 111,
    MOVE: 112,
    ACTION: 113,
});

const PLAYER_ACTION = Object.freeze({
    NONE: 0,
    MELEE: 1,
    RANGED: 2,
    SHIELD: 3,
});

const PLAYER_UPGRADE = Object.freeze({
    MELEE: 'melee',
    RANGED: 'ranged',
    SHIELD: 'shield',
    HEALTH: 'health',
});

module.exports = {
    DEFAULT_ENGINE_HOST,
    DEFAULT_ENGINE_PORT,
    DEFAULT_ENGINE_MAP_DIRECTORY,
    DEFAULT_ROOM_READY_TIMEOUT_MS,
    ENGINE_INPUT_TYPE,
    PLAYER_ACTION,
    PLAYER_UPGRADE,
};
