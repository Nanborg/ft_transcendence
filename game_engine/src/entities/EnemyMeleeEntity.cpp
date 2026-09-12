#include "EnemyMeleeEntity.hpp"
#include <GameEngine.hpp>

EnemyMeleeEntity::EnemyMeleeEntity( int posX, int posY, int ownerId, int damage, float sizeScale ):
	AbstractHitboxEntity(EntityTypes::ENEMYMELEE, static_cast<int>(static_cast<float>(g_game->getScale()) * sizeScale), posX, posY, 0, 0, 2, ownerId, damage) {}

EnemyMeleeEntity::~EnemyMeleeEntity( void ) {}
