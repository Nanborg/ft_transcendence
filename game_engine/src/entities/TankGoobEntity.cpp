#include "TankGoobEntity.hpp"

const float		TankGoobEntity::_aggroRange = 8.f;
const float		TankGoobEntity::_aggroLoseRange = 14.f;
const float		TankGoobEntity::_attackRange = 1.8f;
const float		TankGoobEntity::_moveSpeed = 0.07f;
const float		TankGoobEntity::_slamHitboxScale = 3.f;
const int		TankGoobEntity::_slamDamage = 3;
const int		TankGoobEntity::_slamCooldownTicks = 25;
const int		TankGoobEntity::_slamAnimationFrames = 4;
const int		TankGoobEntity::_slamPrepareTicks = 5;
const int		TankGoobEntity::_slamChargeTicks = 5;
const int		TankGoobEntity::_slamImpactTicks = 2;
const int		TankGoobEntity::_slamRecoveryTicks = 3;

TankGoobEntity::TankGoobEntity(int posX, int posY):
	AbstractMovingEntity(EntityTypes::TANKGOOB, g_game->getScale(), posX, posY, 0, 0, 500, false), _targetEntityId(-1), _dirX(0), _dirY(1), _slamFrame(-1), _slamCooldown(0), _slamPhaseTicks(0)
{
	setGold(20);
	_state["action"] = "idle";
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
	_state["slamFrame"] = -1;
}

TankGoobEntity::~TankGoobEntity( void ) {}

void TankGoobEntity::_clearTarget(void)
{
	_targetEntityId = -1;
	_velX = 0;
	_velY = 0;
	_state["action"] = "idle";
}

void TankGoobEntity::_updateDirection(const AbstractEntity* target)
{
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;
	if (dx == 0 && dy == 0)
		return;
	const long absDx = dx < 0 ? -dx : dx;
	const long absDy = dy < 0 ? -dy : dy;
	if (absDx > absDy)
	{
		_dirX = dx < 0 ? -1 : 1;
		_dirY = 0;
	}
	else
	{
		_dirX = 0;
		_dirY = dy < 0 ? -1 : 1;
	}
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
}

void TankGoobEntity::_startSlam( void )
{
    _velX = 0;
    _velY = 0;
    _slamFrame = 0;
	_slamPhaseTicks = 0;

    _state["action"] = "slam";
    _state["slamFrame"] = _slamFrame;
}

bool TankGoobEntity::_tickSlam( void )
{
    _velX = 0;
    _velY = 0;
	int frameDuration = _slamRecoveryTicks;
	if (_slamFrame == 0)
		frameDuration = _slamPrepareTicks;
	else if (_slamFrame == 1)
		frameDuration = _slamChargeTicks;
	else if (_slamFrame == 2)
		frameDuration = _slamImpactTicks;
    _slamPhaseTicks++;
	if (_slamPhaseTicks < frameDuration)
		return false;
	_slamPhaseTicks = 0;
	_slamFrame++;
    if (_slamFrame == 2)
    {
        g_game->spawnEntity(
                new EnemyMeleeEntity(
                    _posX,
                    _posY,
                    _id,
                    _slamDamage,
                    _slamHitboxScale
            )
        );
    }
    if (_slamFrame >= _slamAnimationFrames)
    {
        _slamFrame = -1;
        _slamCooldown = _slamCooldownTicks;
        _state["action"] = "idle";
        _state["slamFrame"] = -1;
        return true;
    }
    _state["slamFrame"] = _slamFrame;
    return true;
}

bool	TankGoobEntity::tick( void ) {
	if (_slamCooldown > 0)
		_slamCooldown--;
	if (_slamFrame >= 0)
		return _tickSlam();
	const int oldVelX = _velX;
	const int oldVelY = _velY;
	const int oldDirX = _dirX;
	const int oldDirY = _dirY;
	if (_targetEntityId >= 0)
	{
		GameEngine::entityList_t::iterator targetIt = g_game->getEntityIterator(_targetEntityId);
		if (targetIt == g_game->getEntityList().end())
		{
			_clearTarget();
			return true;
		}
		AbstractEntity* target = targetIt->get();
		const unsigned int dist = target->distance(_posX, _posY);
		const unsigned int loseDistance = static_cast<unsigned int>(static_cast<float>(g_game->getScale()) * _aggroLoseRange);
		if (dist > loseDistance)
		{
			_clearTarget();
			return true;
		}
		_updateDirection(target);
		const unsigned int attackDistance = static_cast<unsigned int>(static_cast<float>(g_game->getScale()) * _attackRange);
		if (dist <= attackDistance)
		{
			_velX = 0;
			_velY = 0;
			if (_slamCooldown == 0)
			{
				_startSlam();
				return true;
			}
			_state["action"] = "idle";
		}
		else if (dist != 0)
		{
			const long dx = target->getPosX() - _posX;
			const long dy = target->getPosY() - _posY;
			const double velocityScale = static_cast<double>(g_game->getScale()) * _moveSpeed / static_cast<double>(dist);
			_velX = static_cast<int>(static_cast<double>(dx) * velocityScale);
			_velY = static_cast<int>(static_cast<double>(dy) * velocityScale);
			_state["action"] = "fly";
		}
		const bool velocityChanged = oldVelX != _velX || oldVelY != _velY;
		const bool directionChanged = oldDirX != _dirX || oldDirY != _dirY;
		return velocityChanged || directionChanged;
	}
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	if (!nearest)
		return false;
	const unsigned int aggroDistance = static_cast<unsigned int>(static_cast<float>(g_game->getScale()) * _aggroRange);
	if (nearest->distance(_posX, _posY) <= aggroDistance)
	{
		_targetEntityId = nearest->getId();
		_updateDirection(nearest);
		return true;
	}
	return false;
}
