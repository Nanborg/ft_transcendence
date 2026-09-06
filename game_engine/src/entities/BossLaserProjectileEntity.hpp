#ifndef BOSSLASERPROJECTILEENTITY_HPP
#define BOSSLASERPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>

class BossLaserProjectileEntity: public AbstractHitboxEntity
{
public:
	BossLaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage );
	~BossLaserProjectileEntity( void );
};

#endif
