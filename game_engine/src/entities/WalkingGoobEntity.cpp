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
		} else {
			const int oldVelX = _velX;
			const int oldVelY = _velY;										// following logic
			long dx = _target->getPosX() - _posX;
			long dy = _target->getPosY() - _posY;
			dx *= g_game->getScale() * _velCap;
			dy *= g_game->getScale() * _velCap;
			if (dist != 0) {
				_velX = dx / dist;
				_velY = dy / dist;
			}
			return oldVelX != _velX || oldVelY != _velY;		// only update if change in trajectory
		}
	} else {												// no aggro
		AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
		if (!nearest)
			return false;
		if (nearest->distance(_posX, _posY) < g_game->getScale() * _aggroRange) {
			_target = nearest;
			std::cout << "aggro: " << _id << ", dist: " << nearest->distance(_posX, _posY) << ", range: " << (int) g_game->getScale() * _aggroRange << ", scale: " << g_game->getScale() << std::endl;
		}		// found player close enough
		return false;
	}
}
