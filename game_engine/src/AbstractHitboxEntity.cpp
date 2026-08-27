#include "AbstractHitboxEntity.hpp"
#include "enumEntityTypes.h"
#include <GameEngine.hpp>

AbstractHitboxEntity::AbstractHitboxEntity( EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, int ownerId, int damage):
	AbstractMovingEntity(type, size, posX, posY, velX, velY, health, true),
	_ownerId(ownerId),
	_damage(damage) {
}

AbstractHitboxEntity::~AbstractHitboxEntity( void ) {}

int AbstractHitboxEntity::getOwnerId(void) const { return _ownerId; }

bool	AbstractHitboxEntity::_templateTick( void ) {
	bool ret = false;

	_health--;

	const GameEngine::entityList_t&	entities = g_game->getEntityList();
	for (GameEngine::entityList_t::const_iterator it = entities.begin(); it != entities.end(); it++) {
		AbstractEntity*	entity = it->get();
		if (entity->getId() == _ownerId)				// do not hit owner
			continue;
		const EntityFactions hitboxFaction = getFaction();
		const EntityFactions targetFaction = entity->getFaction();
		if (hitboxFaction != EntityFactions::NEUTRAL_FACTION && hitboxFaction == targetFaction)
			continue;
		if (entity->getPassableHitBox())				// check if entity ignores hitboxes
			continue;
		if (!entity->checkCollision(*this))				// check for collision with entity
			continue;

		_health = -1;
		ret = true;
		if (g_game->canDamage(this, entity))
			g_game->applyDamage(entity, _damage, _ownerId);
		if (_typeId == EntityTypes::LASERPROJECTILE || _typeId == EntityTypes::BOSSPROJECTILE || _typeId == EntityTypes::BOSSLASERPROJECTILE || _typeId == EntityTypes::ENEMYPROJECTILE)
			break;
	}
	ret |= AbstractMovingEntity::_templateTick();
	return ret;
}

bool	AbstractHitboxEntity::tick( void ) {
	return false;
}
