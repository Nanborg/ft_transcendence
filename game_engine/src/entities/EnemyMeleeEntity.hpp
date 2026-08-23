#ifndef ENEMYMELEEENTITY_HPP
#define ENEMYMELEEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class EnemyMeleeEntity: public AbstractHitboxEntity
{
public:
        EnemyMeleeEntity(int posX, int posY, int ownerId, int damage, float sizeScale = 0.9f);
        ~EnemyMeleeEntity( void );
private:
        static const int _lifetimeTicks;
};

#endif