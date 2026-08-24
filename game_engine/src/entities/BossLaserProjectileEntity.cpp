#include "BossLaserProjectileEntity.hpp"

const int BossLaserProjectileEntity::_lifetimeTicks = 40;
BossLaserProjectileEntity::BossLaserProjectileEntity(int posX, int posY, int velX, int velY, int ownerId, int damage) : AbstractHitboxEntity(EntityTypes::BOSSLASERPROJECTILE, g_game->getScale() * 1.5f,
posX, posY, velX, velY, _lifetimeTicks, ownerId, damage) {}
BossLaserProjectileEntity::~BossLaserProjectileEntity(void) {}