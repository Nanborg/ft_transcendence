#include "TankGoobEntity.hpp"

TankGoobEntity::TankGoobEntity(int posX, int posY):
	AbstractMovingEntity(EntityTypes::TANKGOOB, g_game->getScale(), posX, posY, 0, 0, 500, false) {setGold(20);}

TankGoobEntity::~TankGoobEntity( void ) {}

bool	TankGoobEntity::tick( void ) {
	return false;
}
