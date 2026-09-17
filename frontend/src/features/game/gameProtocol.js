// WHY: Game protocol constants document the shared contract between UI and backend
// WHY: Numeric action ids must match backend/game engine
export const PLAYER_ACTION = Object.freeze({
	NONE: 0,
	MELEE: 1,
	RANGED: 2,
	SHIELD: 3,
});

// WHY: Entity ids define render and gameplay categories
export const ENTITY_TYPE = Object.freeze({
	PLAYER: 1,
	WALL: 2,

	WALKING_ROBOT: 100,
	SHOOTING_ROBOT: 101,
	TANK_ROBOT: 102,
	BOSS: 109,

	LASER_SLASH: 200,
	LASER_PROJECTILE: 201,
	LASER_SHIELD: 202,
	BOSS_PROJECTILE: 203,
	ENEMY_PROJECTILE: 204,
	ENEMY_MELEE: 205,
	BOSS_LASER_PROJECTILE: 206,

	CHECKPOINT: 300,
	SPAWN_POINT: 301,
});
