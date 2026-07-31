#include "PlayerEntity.hpp"

PlayerEntity::PlayerEntity( int playerId, int posX, int posY, int velX, int velY ):
	AbstractMovingEntity(EntityTypes::PLAYERENTITY, g_game->getScale(), posX, posY, velX, velY, 10, false),
	_playerId(playerId),
	_receivedInput(true) {
		std::cout << "new player (id " << _playerId << ")\n";
	}

PlayerEntity::~PlayerEntity( void ) {}

bool	PlayerEntity::tick( void ) {
	// TODO(neon-05): Finalize player state for game_state serialization:
	// HP, score, XP/level, alive/dead state, arena bounds, and input effects.
	if (_receivedInput) {
		_receivedInput = false;
		return true;
	}
	return false;
}

void PlayerEntity::movementInput( int velX, int velY ) {
	_receivedInput = true;
	_velX = velX * g_game->getScale();
	_velY = velY * g_game->getScale();
}
