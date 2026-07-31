#include "WalkingGoobEntity.hpp"

const float	WalkingGoobEntity::_aggroRange = 5.f;
const float	WalkingGoobEntity::_aggroLose = 10.f;

WalkingGoobEntity::WalkingGoobEntity( int posX, int posY ):
	AbstractMovingEntity(EntityTypes::WALKINGGOOB, g_game->getScale(), posX, posY, 0, 0, 100, false),
	_target(NULL) {}

WalkingGoobEntity::~WalkingGoobEntity( void ) {}

bool WalkingGoobEntity::tick( void ) {
	unsigned int dist;
	if (_target) {											// already aggro'ed
		dist = _target->distance(_posX, _posY);
		if (dist > g_game->getScale() * _aggroLose) {		// lost aggro
			_target = NULL;
			_velX = 0;
			_velY = 0;
			return true;
		} else {											// following logic
			long dx, dy;
			int old_vX = _velX, old_vY = _velY;
			dx = (_target->getPosX() - _posX) * g_game->getScale() * _velCap;
			dx = (_target->getPosY() - _posY) * g_game->getScale() * _velCap;
			_velX = dx / dist;
			_velY = dy / dist;
			return old_vX != _velX || old_vY != _velY;		// only update if change in trajectory
		}
	} else {												// no aggro
		AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
		if (nearest->distance(_posX, _posY) < g_game->getScale() * _aggroRange)		// found player close enough
			_target = nearest;
		return false;
	}
}
