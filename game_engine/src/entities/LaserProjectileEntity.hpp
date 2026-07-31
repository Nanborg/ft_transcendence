#ifndef LASERPROJECTILEENTITY_HPP
#define LASERPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class LaserProjectileEntity: public AbstractHitboxEntity
{
public:
	LaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId );
	~LaserProjectileEntity( void );
};

#endif
