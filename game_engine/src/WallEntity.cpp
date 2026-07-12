#include "WallEntity.hpp"

WallEntity::WallEntity(int posX, int posY): AbstractEntity(EntityTypes::WALLENTITY, 10, posX, posY, 10, false) {}

WallEntity::~WallEntity(void) {}
