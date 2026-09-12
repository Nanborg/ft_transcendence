#include "CheckpointEntity.hpp"
#include <GameEngine.hpp>

CheckpointEntity::CheckpointEntity( int posX, int posY ):
	AbstractEntity(EntityTypes::CHECKPOINT, g_game->getScale() * 5.f, posX, posY, INVINCIBLE_HEALTH, true) {}

CheckpointEntity::~CheckpointEntity( void ) {}
