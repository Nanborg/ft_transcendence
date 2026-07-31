#include "WallEntity.hpp"

WallEntity::WallEntity(int posX, int posY): AbstractEntity(EntityTypes::WALLENTITY, g_game->getScale(), posX, posY, 0x7FFFFFFF, false) {}

WallEntity::~WallEntity(void) {}
