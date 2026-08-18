#include "ShootingGoobEntity.hpp"

const float	ShootingGoobEntity::_fleeDist = 5.f;
const float	ShootingGoobEntity::_range = 15.f;

ShootingGoobEntity::ShootingGoobEntity( int posX, int posY ):
	AbstractMovingEntity(EntityTypes::SHOOTINGGOOB, g_game->getScale(), posX, posY, 0, 0, 100, false) {setGold(15);}

ShootingGoobEntity::~ShootingGoobEntity( void ) {}

bool	ShootingGoobEntity::tick( void ) {
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	if (!nearest)
		return false;
	unsigned int dist = nearest->distance(_posX, _posY);
	int old_vX = _velX, old_vY = _velY;
	if (dist < g_game->getScale() * _fleeDist) {		// too close
		long dx, dy;
		dx = (_posX - nearest->getPosX());
		dx *= g_game->getScale() * _velCap;
		dy = (_posY - nearest->getPosY());
		dy *= g_game->getScale() * _velCap;
		if (dist != 0) {
			_velX = dx / dist;
			_velY = dy / dist;
		}
		return old_vX != _velX || old_vY != _velY;			// only update if change in trajectory
	} else {
		_velX = 0;
		_velY = 0;
	}
	if (dist < g_game->getScale() * _range) {	// close enough to shoot
	}
	return old_vX != _velX || old_vY != _velY;
}
