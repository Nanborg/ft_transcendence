#include "CheckpointEntity.hpp"

CheckpointEntity::CheckpointEntity( int posX, int posY ):
	AbstractEntity(EntityTypes::CHECKPOINT, g_game->getScale() * 5.f, posX, posY, 0x7FFFFFFF, true) {}

CheckpointEntity::~CheckpointEntity( void ) {}
