#include "WalkingGoobEntity.hpp"

const float	WalkingGoobEntity::_aggroRange = 5.f;
const float	WalkingGoobEntity::_aggroLose = 10.f;

WalkingGoobEntity::WalkingGoobEntity( int posX, int posY ):
	AbstractMovingEntity(EntityTypes::WALKINGGOOB, g_game->getScale(), posX, posY, 0, 0, 100, false),
	_targetEntityId(-1) {}

WalkingGoobEntity::~WalkingGoobEntity( void ) {}




bool WalkingGoobEntity::tick( void ) {
	unsigned int dist;
	if (_targetEntityId >= 0)
	{
		GameEngine::entityList_t::iterator targetIt = g_game->getEntityIterator(_targetEntityId);
		if (targetIt == g_game->getEntityList().end())
		{
			const bool wasMoving = _velX != 0 || _velY != 0;
			_targetEntityId = -1;
			_velX = 0;
			_velY = 0;
			return wasMoving;
		}
		AbstractEntity* target = targetIt->get();
		dist = target->distance(_posX, _posY);
		if (dist > g_game->getScale() * _aggroLose)
		{
			_targetEntityId = -1;
			_velX = 0;
			_velY = 0;
			return true;
		}
		const int oldVelX = _velX;
		const int oldVelY = _velY;
		long dx = target->getPosX() - _posX;
		long dy = target->getPosY() - _posY;
		dx *= g_game->getScale() * _velCap;
		dy *= g_game->getScale() * _velCap;
		if (dist != 0)
		{
			_velX = dx / dist;
			_velY = dy / dist;
		}
		return oldVelX != _velX || oldVelY != _velY;
	}
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	if (!nearest)
		return false;
	if (nearest->distance(_posX, _posY) < g_game->getScale() * _aggroRange)
	{
		_targetEntityId = nearest->getId();
		std::cout
				<< "aggro: " << _id
				<< ", target: " << _targetEntityId
				<< ", dist: " << nearest->distance(_posX, _posY)
				<< ", range: "
				<< static_cast<int>(g_game->getScale() * _aggroRange)
				<< ", scale: " << g_game->getScale()
				<< std::endl;
	}
	return false;
}
