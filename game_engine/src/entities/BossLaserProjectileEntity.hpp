#ifndef BOSSLASERPROJECTILEENTITY_HPP
#define BOSSLASERPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class BossLaserProjectileEntity: public AbstractHitboxEntity
{
public:
    BossLaserProjectileEntity(
            int posX,
            int posY,
            int velX,
            int velY,
            int ownerId,
            int damage
    );
    ~BossLaserProjectileEntity( void );

private:
    static const int _lifetimeTicks;
};

#endif