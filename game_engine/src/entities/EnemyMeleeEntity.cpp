#include "EnemyMeleeEntity.hpp"

const int EnemyMeleeEntity::_lifetimeTicks = 2;

EnemyMeleeEntity::EnemyMeleeEntity(int posX, int posY, int ownerId, int damage, float sizeScale):
    AbstractHitboxEntity(EntityTypes::ENEMYMELEE, static_cast<int>(
        static_cast<float>(
            g_game->getScale()
        ) * sizeScale
    ), posX, posY, 0, 0, _lifetimeTicks, ownerId, damage) {}
EnemyMeleeEntity::~EnemyMeleeEntity( void ) {}