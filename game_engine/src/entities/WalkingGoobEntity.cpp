#include "WalkingGoobEntity.hpp"
#include <GameEngine.hpp>

const float	WalkingGoobEntity::_aggroRange = 5.f;
const float	WalkingGoobEntity::_aggroLose = 10.f;
const float     WalkingGoobEntity::_attackRange = 1.5f;
const float     WalkingGoobEntity::_moveSpeed = 0.13f;
const float     WalkingGoobEntity::_chargeSpeed = 1.0f;
const int	WalkingGoobEntity::_attackDamage = 1;
const int	WalkingGoobEntity::_attackCooldownTicks = 10;

WalkingGoobEntity::WalkingGoobEntity( int posX, int posY ):
		AbstractMovingEntity(EntityTypes::WALKINGGOOB, g_game->getScale(), posX, posY, 0, 0, 300, false),
	_targetEntityId(-1),
	_attackFrame(-1),
	_attackCooldown(0),
	_attackDirX(0),
	_attackDirY(1)
{
	setGold(10);
	_state["action"] = "idle";
	_state["attackFrame"] = -1;
	_state["dirX"] = _attackDirX;
	_state["dirY"] = _attackDirY;
}

WalkingGoobEntity::~WalkingGoobEntity( void ) {}

bool WalkingGoobEntity::canPassThroughPlayer( void ) const {
	return _attackFrame >= 1 && _attackFrame <= 3;
}

void WalkingGoobEntity::_start_attack( const AbstractEntity* target ) {
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;
	const long absDx = dx < 0 ? -dx : dx;
	const long absDy = dy < 0 ? -dy : dy;

	if (absDx > absDy)
	{
		_attackDirX = dx < 0 ? -1 : 1;
		_attackDirY = 0;
	}
	else
	{
		_attackDirX = 0;
		_attackDirY = dy < 0 ? -1 : 1;
	}

	_velX = 0;
	_velY = 0;
	_attackFrame = 0;

	_state["action"] = "charge";
	_state["attackFrame"] = _attackFrame;
	_state["dirX"] = _attackDirX;
	_state["dirY"] = _attackDirY;
}

bool WalkingGoobEntity::_tick_attack( void ) {
	const bool chargeWasBlocked =
		_attackFrame >= 1 &&
		_attackFrame <= 3 &&
		_velX == 0 &&
		_velY == 0;
	if (chargeWasBlocked)
	{
		_attackFrame = 4;
		_velX = 0;
		_velY = 0;
		_state["attackFrame"] = _attackFrame;
		return true;
	}
	_attackFrame++;
	if (_attackFrame >= 1 && _attackFrame <= 3)
	{
		const int chargeVelocity = static_cast<int>(static_cast<float>(g_game->getScale()) * _chargeSpeed);
		_velX = _attackDirX * chargeVelocity;
		_velY = _attackDirY * chargeVelocity;
	}
	else
	{
		_velX = 0;
		_velY = 0;
	}

	if (_attackFrame >= 5)
	{
		_velX = 0;
		_velY = 0;
		_attackFrame = -1;
		_attackCooldown = _attackCooldownTicks;
		_state["action"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}

	_state["attackFrame"] = _attackFrame;

	if (_attackFrame == 2)
	{
		const int hitboxOffeset = static_cast<int>(
			static_cast<float>(g_game->getScale()) * 0.75f
		);
		const long hitboxPosX =
			_posX + static_cast<long>(
				_attackDirX *
				hitboxOffeset
			);
		const long hitboxPosY =
			_posY + static_cast<long>(
				_attackDirY *
				hitboxOffeset
			);

		g_game->spawnEntity(
			new EnemyMeleeEntity(
				hitboxPosX,
				hitboxPosY,
				_id,
				_attackDamage,
				g_game->getScale() * 0.9f
			)
		);
	}

	return true;
}

bool WalkingGoobEntity::tick( void ) {
	if (_attackCooldown > 0)
		_attackCooldown--;
	if (_attackFrame >= 0)
		return _tick_attack();
	if (_targetEntityId >= 0)
	{
		GameEngine::entityList_t::iterator targetIt = g_game->getEntityIterator(_targetEntityId);
		if (targetIt == g_game->getEntityList().end())
		{
			const bool wasMoving = _velX != 0 || _velY != 0;
			_targetEntityId = -1;
			_velX = 0;
			_velY = 0;
			return wasMoving;
		}
		AbstractEntity* target = targetIt->get();
		const unsigned int dist = target->distance(_posX, _posY);
		if (dist > g_game->getScale() * _aggroLose)
		{
			_targetEntityId = -1;
			_velX = 0;
			_velY = 0;
			return true;
		}
		if (dist <= g_game->getScale() * _attackRange)
		{
			const bool wasMoving = _velX != 0 || _velY != 0;
			_velX = 0;
			_velY = 0;
			if (_attackCooldown == 0)
			{
				_start_attack(target);
				return true;
			}
			return wasMoving;
		}
		const int oldVelX = _velX;
		const int oldVelY = _velY;
		long dx = target->getPosX() - _posX;
		long dy = target->getPosY() - _posY;
		dx *= g_game->getScale() * _moveSpeed;
		dy *= g_game->getScale() * _moveSpeed;
		if (dist != 0)
		{
			_velX = dx / dist;
			_velY = dy / dist;
		}
		return oldVelX != _velX || oldVelY != _velY;
	}
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	if (!nearest)
		return false;
	if (nearest->distance(_posX, _posY) < g_game->getScale() * _aggroRange)
	{
		_targetEntityId = nearest->getId();
	}
	return false;
}
