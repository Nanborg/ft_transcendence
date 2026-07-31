#include "ShootingGoobEntity.hpp"

const float	ShootingGoobEntity::_fleeDist = 5.f;
const float	ShootingGoobEntity::_range = 15.f;

ShootingGoobEntity::ShootingGoobEntity( int posX, int posY ):
	AbstractMovingEntity(EntityTypes::SHOOTINGGOOB, g_game->getScale(), posX, posY, 0, 0, 100, false) {}

ShootingGoobEntity::~ShootingGoobEntity( void ) {}

bool	ShootingGoobEntity::tick( void ) {
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	unsigned int dist = nearest->distance(_posX, _posY);
	if (dist < g_game->getScale() * _fleeDist) {		// too close
		long dx, dy;
		int old_vX = _velX, old_vY = _velY;
		dx = (_posX - nearest->getPosX()) * g_game->getScale() * _velCap;
		dx = (_posY - nearest->getPosY()) * g_game->getScale() * _velCap;
		_velX = dx / dist;
		_velY = dy / dist;
		return old_vX != _velX || old_vY != _velY;			// only update if change in trajectory
	} else if (dist < g_game->getScale() * _range) {	// close enough to shoot
		return false;
	} else {
		return false;
	}
}
