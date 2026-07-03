#include "AbstractMovingEntity.hpp"

AbstractMovingEntity::AbstractMovingEntity( unsigned int type, int size, int posX, int posY, int velX, int velY ):
	AbstractEntity(type, size, posX, posY),
	_velX(velX),
	_velY(velY) {}

AbstractMovingEntity::~AbstractMovingEntity( void ) {}

bool AbstractMovingEntity::tick( void ) { std::cout << "AbstractMovingEntity::tick\n"; return false; }
// TODO(neon-05): Normalize movement integration (fixed dt, velocity bounds,
//deterministic order) to ensure reproducible ticks.
bool AbstractMovingEntity::_templateTick( void ) { _posX += _velX; _posY += _velY; return false; }
