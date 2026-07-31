#include "LaserShieldEntity.hpp"

LaserShieldEntity::LaserShieldEntity( int posX, int posY, int health, int ownerId ):
	AbstractHitboxEntity(EntityTypes::LASERSHIELD, g_game->getScale() * 1.5f, posX, posY, 0, 0, health, ownerId),
	_max_health(health) {}

LaserShieldEntity::~LaserShieldEntity( void ) {}
