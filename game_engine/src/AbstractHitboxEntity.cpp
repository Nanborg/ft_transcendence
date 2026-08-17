#include "AbstractHitboxEntity.hpp"
#include <GameEngine.hpp>

AbstractHitboxEntity::AbstractHitboxEntity( EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, int ownerId, int damage):
	AbstractMovingEntity(type, size, posX, posY, velX, velY, health, true),
	_ownerId(ownerId),
	_damage(damage) {
}

AbstractHitboxEntity::~AbstractHitboxEntity( void ) {}

bool	AbstractHitboxEntity::_templateTick( void ) {
	bool ret = AbstractMovingEntity::_templateTick();

	_health--;

	const GameEngine::entityList_t&	entities = g_game->getEntityList();
	bool hit = false;
	std::cout << "hhh" << std::endl;
	for (GameEngine::entityList_t::const_iterator it = entities.begin(); it != entities.end(); it++) {
		AbstractEntity*	entity = it->get();
		if (entity->getId() == _ownerId)				// do not hit owner
			continue;
		if (entity->getPassableHitBox())				// check if entity ignores hitboxes
			continue;
		if (!entity->checkCollision(*this))				// check for collision with entity
			continue;

		_health = -1;
		if (entity->getHealth() != INVINCIBLE_HEALTH)	// check if entity is invincible
			entity->setHealth(entity->getHealth() - _damage);
		std::cout << "hhh" << entity->getHealth() << std::endl;
	}
	return ret;
}

bool	AbstractHitboxEntity::tick( void ) {
	return false;
}
