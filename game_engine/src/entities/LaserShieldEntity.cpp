#include "LaserShieldEntity.hpp"

LaserShieldEntity::LaserShieldEntity( int posX, int posY, int health, int ownerId, int damage ):
	AbstractHitboxEntity( EntityTypes::LASERSHIELD, g_game->getScale() * 1.5f, posX, posY, 0, 0, health, ownerId, damage),
	_max_health(health) {}

LaserShieldEntity::~LaserShieldEntity( void ) {}
