#include "BossProjectileEntity.hpp"

BossProjectileEntity::BossProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::BOSSPROJECTILE, g_game->getScale(), posX, posY, velX, velY, 50, ownerId, damage) {}

BossProjectileEntity::~BossProjectileEntity( void ) {}
