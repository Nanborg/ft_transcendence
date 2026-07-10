#include "AbstractMovingEntity.hpp"

AbstractMovingEntity::AbstractMovingEntity( unsigned int type, int size, int posX, int posY, int velX, int velY, int health, int passableHitBox ):
	AbstractEntity(type, size, posX, posY, health, passableHitBox),
	_velX(velX),
	_velY(velY) {}

AbstractMovingEntity::~AbstractMovingEntity( void ) {}

bool AbstractMovingEntity::tick( void ) { return false; }
bool AbstractMovingEntity::_templateTick( void ) { _posX += _velX; _posY += _velY; return false; }
