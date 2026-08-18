#include "EnemyProjectileEntity.hpp"

const int EnemyProjectileEntity::_lifetimeTicks = 30;
EnemyProjectileEntity::EnemyProjectileEntity(int posX, int posY, int velX, int velY, int ownerId, int damage) : AbstractHitboxEntity(EntityTypes::ENEMYPROJECTILE, g_game->getScale() * 0.5f, posX, posY, velX, velY, _lifetimeTicks, ownerId, damage) {}
EnemyProjectileEntity::~EnemyProjectileEntity(void) {}
