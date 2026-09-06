#include "BossLaserProjectileEntity.hpp"
#include <GameEngine.hpp>

BossLaserProjectileEntity::BossLaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage ):
	AbstractHitboxEntity(EntityTypes::BOSSLASERPROJECTILE, g_game->getScale() * 1.5f, posX, posY, velX, velY, 40, ownerId, damage) {}

	BossLaserProjectileEntity::~BossLaserProjectileEntity(void) {}
