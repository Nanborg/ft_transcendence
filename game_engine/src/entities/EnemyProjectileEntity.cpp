#include "EnemyProjectileEntity.hpp"
#include <GameEngine.hpp>

EnemyProjectileEntity::EnemyProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::ENEMYPROJECTILE, g_game->getScale() * 0.5f, posX, posY, velX, velY, 30, ownerId, damage) {}

EnemyProjectileEntity::~EnemyProjectileEntity( void ) {}
