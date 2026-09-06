#include "LaserProjectileEntity.hpp"
#include <GameEngine.hpp>

const float	LaserProjectileEntity::_speed = 0.5f;

LaserProjectileEntity::LaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::LASERPROJECTILE, g_game->getScale() * .5f, posX, posY, velX * _speed, velY * _speed, 40, ownerId, damage) {}

LaserProjectileEntity::~LaserProjectileEntity( void ) {}
