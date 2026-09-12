#include "EnemyMeleeEntity.hpp"
#include <GameEngine.hpp>

EnemyMeleeEntity::EnemyMeleeEntity( int posX, int posY, int ownerId, int damage, int size ):
	AbstractHitboxEntity(EntityTypes::ENEMYMELEE, size, posX, posY, 0, 0, 2, ownerId, damage) {}

EnemyMeleeEntity::~EnemyMeleeEntity( void ) {}
