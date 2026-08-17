#include "PlayerEntity.hpp"

const float	PlayerEntity::_slashDist = 0.5f;
const int	PlayerEntity::_meleeCooldownTicks = 10;
const int	PlayerEntity::_rangedCooldownTicks = 20;
const int	PlayerEntity::_shieldCooldownTicks = 30;
const int	PlayerEntity::_shieldBaseHealth = 30;
const int	PlayerEntity::_shieldHealthPerLevel = 10;

PlayerEntity::PlayerEntity( int playerId, int posX, int posY, int velX, int velY ):
	AbstractMovingEntity(EntityTypes::PLAYERENTITY, g_game->getScale(), posX, posY, velX, velY, 10, false),
	_playerId(playerId),
	_receivedInput(true),
	_curAction(PlayerActions::NOACTION),
	_shieldEntityId(-1) {
			std::cout << "new player (id " << _playerId << ")\n";
		}

PlayerEntity::~PlayerEntity( void ) {}

bool	PlayerEntity::tick( void ) {
	_check_shield_state();
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

void PlayerEntity::_check_shield_state(void)
{
	if (_curAction != PlayerActions::SHIELD || _shieldEntityId < 0)
		return;
	if (g_game->getEntityIterator(_shieldEntityId) != g_game->getEntityList().end())
		return;
	_finish_shield();
}

void PlayerEntity::playerAction( const json& in ) {
	PlayerActions action = in["action"];
	switch (action)
	{
	case PlayerActions::NOACTION:
		if (_curAction == PlayerActions::SHIELD)
			_finish_shield();
		else
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
		break;

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
	GameEngine::PlayerData* playerData = g_game->getPlayerData(_playerId);
	if (!playerData || playerData->cooldowns.melee > 0)
		return;
	_curAction = PlayerActions::MELEEATT;

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
	playerData->cooldowns.melee = _meleeCooldownTicks;
	g_game->sendPlayerStateUpdate(*playerData);
	_curAction = PlayerActions::NOACTION;
}

void	PlayerEntity::_action_range( const json& in ) {
	if (_curAction != PlayerActions::NOACTION)
		return;
	if (!in["dirX"].is_number_integer())
		return;
	if (!in["dirY"].is_number_integer())
		return;
	GameEngine::PlayerData* playerData = g_game->getPlayerData(_playerId);
	if (!playerData || playerData->cooldowns.ranged > 0)
		return;
	_curAction = PlayerActions::RANGEATT;
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
	playerData->cooldowns.ranged = _rangedCooldownTicks;
	g_game->sendPlayerStateUpdate(*playerData);
	_curAction = PlayerActions::NOACTION;
}

void PlayerEntity::_action_shield(const json& in)
{
    (void)in;

    if (_curAction != PlayerActions::NOACTION)
        return;
    GameEngine::PlayerData* playerData =
        g_game->getPlayerData(_playerId);
    if (!playerData ||
        playerData->cooldowns.shield > 0)
        return;
    const int shieldHealth =
        _shieldBaseHealth +
        playerData->upgrades.shield *
            _shieldHealthPerLevel;
    LaserShieldEntity* shield =
        new LaserShieldEntity(
            _posX,
            _posY,
            shieldHealth,
            _id,
            0
        );
    _shieldEntityId = shield->getId();
    _curAction = PlayerActions::SHIELD;
    g_game->spawnEntity(shield);
}

void PlayerEntity::_finish_shield(void)
{
    if (_shieldEntityId >= 0)
    {
        GameEngine::entityList_t::iterator shieldIt =
            g_game->getEntityIterator(_shieldEntityId);
        if (shieldIt != g_game->getEntityList().end())
            g_game->deleteEntity(shieldIt);
    }
    _shieldEntityId = -1;
    _curAction = PlayerActions::NOACTION;
    GameEngine::PlayerData* playerData =
        g_game->getPlayerData(_playerId);
    if (!playerData)
        return;
    playerData->cooldowns.shield =
        _shieldCooldownTicks;
    g_game->sendPlayerStateUpdate(*playerData);
}
