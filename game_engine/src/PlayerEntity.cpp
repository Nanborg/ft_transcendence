#include "PlayerEntity.hpp"
#include "GameEngine.hpp"

PlayerEntity::PlayerEntity( int playerId, int size, int posX, int posY, int velX, int velY ):
	AbstractMovingEntity(GET_TYPE(PlayerEntity), size, posX, posY, velX, velY),
	_playerId(playerId),
	_receivedInput(true) {
		std::cout << "new player (id " << _playerId << ")\n";
	}

PlayerEntity::~PlayerEntity( void ) {}

bool	PlayerEntity::tick( void ) {
	// TODO(neon-05): Finalize player state for game_state serialization:
	// HP, score, XP/level, alive/dead state, arena bounds, and input effects.
	std::cout << "Player ticked (x, y) = (" << _posX << ", " << _posY << ")\n";
	if (_receivedInput) {
		_receivedInput = false;
		return true;
	}
	return false;
}

void PlayerEntity::movementInput( int velX, int velY ) {
	_receivedInput = true;
	_velX = velX;
	_velY = velY;
}
