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

	int dist = distance(_posX + _velX, _posY + _velY);
	if (dist > g_game->getScale() * _velCap)
	{
		long dx, dy;
		dx = _velX;
		dx *= g_game->getScale() * _velCap;
		dy = _velY;
		dy *= g_game->getScale() * _velCap;
		if (dist != 0) {
			_velX = dx / dist;
			_velY = dy / dist;
		}
	}
}
