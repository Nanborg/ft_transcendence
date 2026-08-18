#ifndef ENUMENTITYTYPES_H
#define ENUMENTITYTYPES_H

enum EntityFactions {
	NEUTRAL_FACTION =	0,
	PLAYER_FACTION =	1,
	ENEMY_FACTION =		2,
};
// add entries here for all new entity types
enum EntityTypes {
	// not constructible
	NOENTITY =			0,
	PLAYERENTITY =		1,

	LASERSLASH =		200,
	LASERPROJECTILE =	201,
	LASERSHIELD =		202,
	BOSSPROJECTILE =	203,
	ENEMYPROJECTILE =	204,

	// constructible
	WALLENTITY =		2,

	WALKINGGOOB =		100,
	SHOOTINGGOOB =		101,
	TANKGOOB =			102,
	LORDGOOB =			109,

	CHECKPOINT =		300,
	SPAWNPOINT =		301,
};

#endif
