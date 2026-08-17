#include "LaserProjectileEntity.hpp"

const float	LaserProjectileEntity::_speed = 2.f;

LaserProjectileEntity::LaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::LASERPROJECTILE, g_game->getScale() * .5f, posX, posY, velX * _speed, velY * _speed, 5, ownerId, damage) {}

LaserProjectileEntity::~LaserProjectileEntity( void ) {}
