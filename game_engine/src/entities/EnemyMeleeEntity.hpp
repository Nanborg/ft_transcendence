#ifndef ENEMYMELEEENTITY_HPP
#define ENEMYMELEEENTITY_HPP

#include <AbstractHitboxEntity.hpp>

class EnemyMeleeEntity: public AbstractHitboxEntity
{
public:
	EnemyMeleeEntity( int posX, int posY, int ownerId, int damage, int size );
	~EnemyMeleeEntity( void );
};

#endif
