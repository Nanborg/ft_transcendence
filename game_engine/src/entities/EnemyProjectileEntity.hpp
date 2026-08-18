#ifndef ENEMYPROJECTILEENTITY_HPP
#define ENEMYPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class EnemyProjectileEntity: public AbstractHitboxEntity
{
    public:
        EnemyProjectileEntity(int posX, int posY, int velX, int velY, int ownerId, int damage);
        ~EnemyProjectileEntity( void );
    private:
        static const int _lifetimeTicks;
};

#endif
