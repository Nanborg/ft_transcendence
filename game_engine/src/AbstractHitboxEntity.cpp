#include "AbstractHitboxEntity.hpp"

AbstractHitboxEntity::AbstractHitboxEntity(EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, int ownerId):
	AbstractMovingEntity(type, size, posX, posY, velX, velY, health, true),
	_ownerId(ownerId) {
}

AbstractHitboxEntity::~AbstractHitboxEntity( void ) {}

bool	AbstractHitboxEntity::_templateTick( void ) {
	_health--;
	_posX += _velX;
	_posY += _velY;
	return false;
}

bool	AbstractHitboxEntity::tick( void ) {
	return false;
}
