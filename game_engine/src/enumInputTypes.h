#ifndef ENUMINPUTTYPES_H
#define ENUMINPUTTYPES_H

enum InputTypes {
	// room management
	R_CREATE =	0,
	R_DESTROY =	1,
	R_START =	2,
	R_STOP =	3,
	R_ENTITIES_ADD =	10,

	// inputs to be sent to rooms
	PING =		100,
	SYNC =		101,

	// requires playerId
	JOIN =		110,
	LEAVE =		111,
	MOVE =		112,
	ACTION =	113,
};

enum PlayerActions {
	NOACTION =	0,
	MELEEATT =	1,
	RANGEATT =	2,
	SHIELD =	3,
};

#endif
