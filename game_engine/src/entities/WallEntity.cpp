#include "WallEntity.hpp"
#include <GameEngine.hpp>

WallEntity::WallEntity( int posX, int posY ):
AbstractEntity(EntityTypes::WALLENTITY, g_game->getScale(), posX, posY, INVINCIBLE_HEALTH, false) {}

WallEntity::~WallEntity( void ) {}
