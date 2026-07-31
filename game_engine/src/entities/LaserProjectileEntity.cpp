#include "LaserProjectileEntity.hpp"

LaserProjectileEntity::LaserProjectileEntity(int posX, int posY, int velX, int velY, int ownerId):
	AbstractHitboxEntity(EntityTypes::LASERPROJECTILE, g_game->getScale() * .5f, posX, posY, velX, velY, 5, ownerId) {}

LaserProjectileEntity::~LaserProjectileEntity( void ) {}
