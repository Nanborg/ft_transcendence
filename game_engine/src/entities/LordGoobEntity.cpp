#include "LordGoobEntity.hpp"

LordGoobEntity::LordGoobEntity(int posX, int posY):
	AbstractEntity(EntityTypes::LORDGOOB, g_game->getScale(), posX, posY, 3000, false) {}

LordGoobEntity::~LordGoobEntity( void ) {}

bool	LordGoobEntity::tick( void ) {
	return false;
}
