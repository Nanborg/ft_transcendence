#include "EnemyMeleeEntity.hpp"

const int EnemyMeleeEntity::_lifetimeTicks = 2;

EnemyMeleeEntity::EnemyMeleeEntity(int posX, int posY, int ownerId, int damage):
    AbstractHitboxEntity(EntityTypes::ENEMYMELEE, g_game->getScale() * 0.9f, posX, posY, 0, 0, _lifetimeTicks, ownerId, damage) {}
EnemyMeleeEntity::~EnemyMeleeEntity( void ) {}