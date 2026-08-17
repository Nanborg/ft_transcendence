#include "PlayerEntity.hpp"

const float	PlayerEntity::_slashDist = 0.5f;

PlayerEntity::PlayerEntity( int playerId, int posX, int posY, int velX, int velY ):
	AbstractMovingEntity(EntityTypes::PLAYERENTITY, g_game->getScale(), posX, posY, velX, velY, 10, false),
	_playerId(playerId),
	_receivedInput(true),
	_curAction(PlayerActions::NOACTION) {
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

void PlayerEntity::playerAction( const json& in ) {
	PlayerActions action = in["action"];
	switch (action)
	{
	case PlayerActions::NOACTION:
		_curAction = PlayerActions::NOACTION;
		break;

	case PlayerActions::MELEEATT:
		_action_melee(in);
		break;

	case PlayerActions::RANGEATT:
		_action_range(in);
		break;

	case PlayerActions::SHIELD:
		_action_shield(in);

	default:
		break;
	}
}

void	PlayerEntity::_action_melee( const json& in ) {
	if (_curAction != PlayerActions::NOACTION)
		return;
	if (!in["dirX"].is_number_integer())
		return;
	if (!in["dirY"].is_number_integer())
		return;
		_curAction = PlayerActions::MELEEATT;

	// add cooldown
	int dirX = in["dirX"], dirY = in["dirY"];
	int dist = distance(_posX + dirX, _posY + dirY);
	long posX = dirX * _slashDist, posY = dirY * _slashDist;
	posX *= g_game->getScale();
	posY *= g_game->getScale();
	if (dist != 0) {
		posX /= dist;
		posY /= dist;
	}
	posX += _posX;
	posY += _posY;
	g_game->spawnEntity(new LaserSlashEntity(posX, posY, _id, 100));
	_curAction = PlayerActions::NOACTION;
}

void	PlayerEntity::_action_range( const json& in ) {
	if (_curAction != PlayerActions::NOACTION)
		return;
	if (!in["dirX"].is_number_integer())
		return;
	if (!in["dirY"].is_number_integer())
		return;
	_curAction = PlayerActions::RANGEATT;
	// add cooldown
	int dirX = in["dirX"], dirY = in["dirY"];
	int dist = distance(_posX + dirX, _posY + dirY);
	long velX = dirX, velY = dirY;
	velX *= g_game->getScale();
	velY *= g_game->getScale();
	if (dist != 0) {
		velX /= dist;
		velY /= dist;
	}
	g_game->spawnEntity(new LaserProjectileEntity(_posX, _posY, velX, velY, _id, 100));
	_curAction = PlayerActions::NOACTION;
}

void	PlayerEntity::_action_shield( const json& in ) {
	if (_curAction != PlayerActions::NOACTION)
		return;
	_curAction = PlayerActions::SHIELD;
	// add cooldown

}
