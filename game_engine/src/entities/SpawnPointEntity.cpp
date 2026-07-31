#include "SpawnPointEntity.hpp"

SpawnPointEntity::SpawnPointEntity( int posX, int posY ):
	AbstractEntity(EntityTypes::SPAWNPOINT, g_game->getScale() * 5.f, posX, posY, 0x7FFFFFFF, true) {}

SpawnPointEntity::~SpawnPointEntity( void ) {}
