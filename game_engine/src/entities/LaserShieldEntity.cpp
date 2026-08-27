#include "LaserShieldEntity.hpp"

LaserShieldEntity::LaserShieldEntity( int posX, int posY, int health, int ownerId, int damage ):
	AbstractHitboxEntity( EntityTypes::LASERSHIELD, g_game->getScale() * 1.5f, posX, posY, 0, 0, health, ownerId, damage),
	_max_health(health)
	{
		setPassableHitBox(false);
		setGold(0);
	}

LaserShieldEntity::~LaserShieldEntity( void ) {}

bool LaserShieldEntity::_templateTick(void)
{
	GameEngine::entityList_t::iterator ownerIt = g_game->getEntityIterator(_ownerId);
	if (ownerIt == g_game->getEntityList().end())
	{
		_health = 0;
		return true;
	}
	AbstractEntity* owner = ownerIt->get();
	const bool changed = _posX != owner->getPosX() || _posY != owner->getPosY();
	_posX = owner->getPosX();
	_posY = owner->getPosY();
	return changed;
}
