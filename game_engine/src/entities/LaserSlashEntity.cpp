#include "LaserSlashEntity.hpp"

LaserSlashEntity::LaserSlashEntity(int posX, int posY, int ownerId):
	AbstractHitboxEntity(EntityTypes::LASERSLASH, g_game->getScale(), posX, posY, 0, 0, 3, ownerId) {}

LaserSlashEntity::~LaserSlashEntity( void ) {}
