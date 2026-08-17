#ifndef BOSSPROJECTILEENTITY_HPP
#define BOSSPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class BossProjectileEntity: public AbstractHitboxEntity {
public:
	BossProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage );
	~BossProjectileEntity( void );
};

#endif
