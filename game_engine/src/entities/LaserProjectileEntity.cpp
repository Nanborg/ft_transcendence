#include "LaserProjectileEntity.hpp"

const float	LaserProjectileEntity::_speed = 0.5f;
const int	LaserProjectileEntity::_lifetimeTicks = 40;

LaserProjectileEntity::LaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::LASERPROJECTILE, g_game->getScale() * .5f, posX, posY, velX * _speed, velY * _speed, _lifetimeTicks, ownerId, damage) {}

LaserProjectileEntity::~LaserProjectileEntity( void ) {}
