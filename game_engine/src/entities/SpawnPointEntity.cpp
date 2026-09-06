#include "SpawnPointEntity.hpp"
#include <GameEngine.hpp>

SpawnPointEntity::SpawnPointEntity( int posX, int posY ):
	AbstractEntity(EntityTypes::SPAWNPOINT, g_game->getScale() * 5.f, posX, posY, INVINCIBLE_HEALTH, true) {}

SpawnPointEntity::~SpawnPointEntity( void ) {}
