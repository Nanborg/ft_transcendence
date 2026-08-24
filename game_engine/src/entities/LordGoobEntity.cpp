#include "LordGoobEntity.hpp"
#include "BossLaserProjectileEntity.hpp"
#include <cmath>

const float		LordGoobEntity::_attackRange = 18.f;
const float		LordGoobEntity::_projectileSpeed = 0.35f;
const float		LordGoobEntity::_projectileSpawnDistance = 1.2f;
const int		LordGoobEntity::_projectileDamage = 2;
const int		LordGoobEntity::_attackCooldownTicks = 25;
const int		LordGoobEntity::_attackFrameDurationTicks = 3;
const int		LordGoobEntity::_attackFrameCount = 4;
const double	LordGoobEntity::_projectileSpread = 0.20;
const int		LordGoobEntity::_phaseTwoCooldownTicks = 20;
const int		LordGoobEntity::_phaseTwoFrameCount = 6;
const int		LordGoobEntity::_phaseTwoFrameDurationTicks = 3;
const int		LordGoobEntity::_phaseTwoRadialProjectileCount = 8;
const double	LordGoobEntity::_phaseTwoFanSpread = 0.24;
const int		LordGoobEntity::_phaseThreeCooldownTicks = 15;
const int		LordGoobEntity::_phaseThreeFrameCount = 6;
const int		LordGoobEntity::_phaseThreeFrameDurationTicks = 3;
const int		LordGoobEntity::_phaseThreeRadialProjectileCount = 12;
const int		LordGoobEntity::_phaseThreeLaserDamage = 4;
const float		LordGoobEntity::_phaseThreeLaserSpeed = 0.22f;
const float		LordGoobEntity::_phaseThreeLaserSpawnDistance = 1.4f;
const double	LordGoobEntity::_phaseThreeFanAngleStep = 0.14;

LordGoobEntity::LordGoobEntity(int posX, int posY):
	AbstractEntity(EntityTypes::LORDGOOB, g_game->getScale(), posX, posY, 3000, false), _targetEntityId(-1), _attackCooldown(0), _attackFrame(-1), _attackFrameTicks(0), _currentPhase(1), _phaseTwoPattern(0), _phaseThreePattern(0), _dirX(0), _dirY(1), _aimX(0), _aimY(1)
{
	_state["phase"] = 1;
	_state["action"] = "idle";
	_state["attackFrame"] = -1;
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
}

LordGoobEntity::~LordGoobEntity( void ) {}

int LordGoobEntity::_getPhase(void) const
{
	if (_health > 2000)
		return 1;
	if (_health > 1000)
		return 2;
	return 3;
}

void LordGoobEntity::_updateDirection(const AbstractEntity* target)
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

void LordGoobEntity::_startPhaseOneAttack(const AbstractEntity* target)
{
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;
	if (dx == 0 && dy == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = dx;
	_aimY = dy;
	_updateDirection(target);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 1;
	_state["action"] = "phase1";
	_state["attackFrame"] = _attackFrame;
}

void LordGoobEntity::_firePhaseOneAttack(void)
{
	const double aimLength = std::sqrt(
		static_cast<double>(_aimX) *
		static_cast<double>(_aimX) +
		static_cast<double>(_aimY) *
		static_cast<double>(_aimY)
	);
	if (aimLength == 0.0)
		return;
	const double normalizedX = static_cast<double>(_aimX) / aimLength;
	const double normalizedY = static_cast<double>(_aimY) / aimLength;
	const double perpendicularX = -normalizedY;
	const double perpendicularY = normalizedX;
	const double spawnDistance =static_cast<double>(g_game->getScale()) * _projectileSpawnDistance;
	const double handOffset = static_cast<double>(g_game->getScale()) * 0.45;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
	const double angles[3] = {-_projectileSpread, 0.0, _projectileSpread};
	for (int i = 0; i < 3; i++)
	{
		const double angle = angles[i];
		const double rotatedX = normalizedX * std::cos(angle) - normalizedY * std::sin(angle);
		const double rotatedY = normalizedX * std::sin(angle) + normalizedY * std::cos(angle);
		const double sideOffset = static_cast<double>(i - 1) * handOffset;
		const int spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * spawnDistance + perpendicularX * sideOffset);
		const int spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * spawnDistance + perpendicularY * sideOffset);
		const int velocityX = static_cast<int>(rotatedX * projectileVelocity);
		const int velocityY = static_cast<int>(rotatedY * projectileVelocity);
		g_game->spawnEntity( new BossProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _projectileDamage));
	}
}

bool LordGoobEntity::_tickPhaseOneAttack(void)
{
	if (_attackFrame < 0)
		return false;
	if (_attackFrame == 2 && _attackFrameTicks == 0)
		_firePhaseOneAttack();
	_attackFrameTicks++;
	if (_attackFrameTicks < _attackFrameDurationTicks)
		return false;
	_attackFrameTicks = 0;
	_attackFrame++;
	if (_attackFrame >= _attackFrameCount)
	{
		_attackFrame = -1;
		_attackCooldown = _attackCooldownTicks;
		_targetEntityId = -1;
		_state["action"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void LordGoobEntity::_startPhaseTwoAttack( const AbstractEntity* target)
{
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;
	if (dx == 0 && dy == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = dx;
	_aimY = dy;
	_updateDirection(target);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 2;
	_state["action"] = "phase2";
	_state["attackFrame"] = _attackFrame;
	_state["attackPattern"] = _phaseTwoPattern;
}

bool LordGoobEntity::_tickPhaseTwoAttack(void)
{
	if (_attackFrame < 0)
		return false;
	if (_attackFrame == 4 && _attackFrameTicks == 0)
		_firePhaseTwoAttack();
	_attackFrameTicks++;
	if (_attackFrameTicks < _phaseTwoFrameDurationTicks)
		return false;
	_attackFrameTicks = 0;
	_attackFrame++;
	if (_attackFrame >= _phaseTwoFrameCount)
	{
		_attackFrame = -1;
		_attackCooldown = _phaseTwoCooldownTicks;
		_targetEntityId = -1;
		_state["action"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void LordGoobEntity::_firePhaseTwoFan(void)
{
	const double aimLength = std::sqrt(
		static_cast<double>(_aimX) *
		static_cast<double>(_aimX) +
		static_cast<double>(_aimY) *
		static_cast<double>(_aimY)
	);
	if (aimLength == 0.0)
		return;
	const double normalizedX = static_cast<double>(_aimX) / aimLength;
	const double normalizedY = static_cast<double>(_aimY) / aimLength;
	const double perpendicularX = -normalizedY;
	const double perpendicularY = normalizedX;
	const double spawnDistance = static_cast<double>(g_game->getScale()) * 1.25;
	const double shoulderOffset = static_cast<double>(g_game->getScale()) * 0.65;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
	const double angles[3] = {-_phaseTwoFanSpread, 0.0, _phaseTwoFanSpread};
	const double origins[3] = {-shoulderOffset, 0.0, shoulderOffset};
	for (int i = 0; i < 3; i++)
	{
		const double cosine = std::cos(angles[i]);
		const double sine = std::sin(angles[i]);
		const double rotatedX = normalizedX * cosine - normalizedY * sine;
		const double rotatedY = normalizedX * sine + normalizedY * cosine;
		const int spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * spawnDistance + perpendicularX * origins[i]);
		const int spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * spawnDistance + perpendicularY * origins[i]);
		const int velocityX = static_cast<int>(rotatedX * projectileVelocity);
		const int velocityY = static_cast<int>(rotatedY * projectileVelocity);
		g_game->spawnEntity(new BossProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _projectileDamage));
	}
}

void LordGoobEntity::_firePhaseTwoRadial(void)
{
	const double fullCircle = 2.0 * std::acos(-1.0);
	const double spawnDistance = static_cast<double>(g_game->getScale()) * 1.25;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
	for (int i = 0; i < _phaseTwoRadialProjectileCount; i++)
	{
		const double angle = fullCircle * static_cast<double>(i) / static_cast<double>(_phaseTwoRadialProjectileCount);
		const double directionX = std::cos(angle);
		const double directionY = std::sin(angle);
		const int	spawnX = static_cast<int>(static_cast<double>(_posX) + directionX * spawnDistance);
		const int	spawnY = static_cast<int>(static_cast<double>(_posY) + directionX * spawnDistance);
		const int	velocityX = static_cast<int>(directionX * projectileVelocity);
		const int	velocityY = static_cast<int>(directionY * projectileVelocity);
		g_game->spawnEntity(new BossProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _projectileDamage));
	}
}

void LordGoobEntity::_firePhaseTwoAttack(void)
{
	if (_phaseTwoPattern == 0)
		_firePhaseTwoFan();
	else
		_firePhaseTwoRadial();
	_phaseTwoPattern = (_phaseTwoPattern + 1) % 2;
}

void LordGoobEntity::_startPhaseThreeAttack( const AbstractEntity* target)
{
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;
	if (dx == 0 && dy == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = dx;
	_aimY = dy;
	_updateDirection(target);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 3;
	_state["action"] = "phase3";
	_state["attackFrame"] = _attackFrame;
	_state["attackPattern"] = _phaseThreePattern;
}

bool LordGoobEntity::_tickPhaseThreeAttack(void)
{
	if (_attackFrame < 0)
		return false;
	if (_attackFrame == 4 && _attackFrameTicks == 0)
		_firePhaseThreeAttack();
	_attackFrameTicks++;
	if (_attackFrameTicks < _phaseThreeFrameDurationTicks)
		return false;
	_attackFrameTicks = 0;
	_attackFrame++;
	if (_attackFrame >= _phaseThreeFrameCount)
	{
		_attackFrame = -1;
		_attackCooldown = _phaseThreeCooldownTicks;
		_targetEntityId = -1;
		_state["action"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void LordGoobEntity::_firePhaseThreeFan(void)
{
    const double aimLength = std::sqrt(
            static_cast<double>(_aimX) *
            static_cast<double>(_aimX) +
            static_cast<double>(_aimY) *
            static_cast<double>(_aimY)
    );
    if (aimLength == 0.0)
        return;
    const double normalizedX = static_cast<double>(_aimX) / aimLength;
    const double normalizedY = static_cast<double>(_aimY) / aimLength;
    const double perpendicularX = -normalizedY;
    const double perpendicularY = normalizedX;
    const double spawnDistance = static_cast<double>(g_game->getScale()) * 1.25;
    const double shoulderOffset = static_cast<double>(g_game->getScale()) * 0.65;
    const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
    for (int i = 0; i < 5; i++)
    {
        const double angle = static_cast<double>(i - 2) * _phaseThreeFanAngleStep;
        const double cosine = std::cos(angle);
        const double sine = std::sin(angle);
        const double rotatedX = normalizedX * cosine - normalizedY * sine;
        const double rotatedY = normalizedX * sine + normalizedY * cosine;
        const double sideOffset =
            i % 2 == 0
                ? -shoulderOffset
                : shoulderOffset;
        const int spawnX = static_cast<int>(
            static_cast<double>(_posX) +
            normalizedX * spawnDistance +
            perpendicularX * sideOffset
        );
        const int spawnY = static_cast<int>(
            static_cast<double>(_posY) +
            normalizedY * spawnDistance +
            perpendicularY * sideOffset
        );
        const int velocityX = static_cast<int>(rotatedX * projectileVelocity);
        const int velocityY = static_cast<int>(rotatedY * projectileVelocity);
        g_game->spawnEntity(
            new BossProjectileEntity(
                spawnX,
                spawnY,
                velocityX,
                velocityY,
                _id,
				_projectileDamage
            )
        );
    }
}

void LordGoobEntity::_firePhaseThreeRadial(void)
{
    const double aimLength = std::sqrt(
            static_cast<double>(_aimX) *
            static_cast<double>(_aimX) +
            static_cast<double>(_aimY) *
            static_cast<double>(_aimY)
    );
    if (aimLength == 0.0)
        return;
    const double normalizedX = static_cast<double>(_aimX) / aimLength;
    const double normalizedY = static_cast<double>(_aimY) / aimLength;
    const double perpendicularX = -normalizedY;
    const double perpendicularY = normalizedX;
    const double forwardOffset = static_cast<double>(g_game->getScale()) * 0.5;
    const double shoulderOffset = static_cast<double>(g_game->getScale()) * 0.65;
    const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
    const double fullCircle = 2.0 * std::acos(-1.0);
    for (
        int i = 0;
        i < _phaseThreeRadialProjectileCount;
        i++
    )
    {
        const double angle =
            fullCircle *
            static_cast<double>(i) /
            static_cast<double>(_phaseThreeRadialProjectileCount);
        const double directionX = std::cos(angle);
        const double directionY = std::sin(angle);
        const double sideOffset = i % 2 == 0 ? -shoulderOffset : shoulderOffset;
        const int spawnX = static_cast<int>(
            static_cast<double>(_posX) +
            normalizedX * forwardOffset +
            perpendicularX * sideOffset
        );
        const int spawnY = static_cast<int>(
            static_cast<double>(_posY) +
            normalizedY * forwardOffset +
            perpendicularY * sideOffset
        );
        const int velocityX = static_cast<int>(directionX * projectileVelocity);
        const int velocityY = static_cast<int>(directionY * projectileVelocity);
        g_game->spawnEntity(
            new BossProjectileEntity(
                spawnX,
                spawnY,
                velocityX,
				velocityY,
                _id,
                _projectileDamage
            )
        );
    }
}

void LordGoobEntity::_firePhaseThreeAttack(void)
{
    if (_phaseThreePattern == 0)
        _firePhaseThreeFan();
    else if (_phaseThreePattern == 1)
        _firePhaseThreeLaser();
    else if (_phaseThreePattern == 2)
        _firePhaseThreeRadial();
    else
        _firePhaseThreeLaser();
    _phaseThreePattern = (_phaseThreePattern + 1) % 4;
}

void LordGoobEntity::_firePhaseThreeLaser(void)
{
	const double aimLength = std::sqrt(
		static_cast<double>(_aimX) *
		static_cast<double>(_aimX) +
		static_cast<double>(_aimY) *
		static_cast<double>(_aimY)
	);
	if (aimLength == 0.0)
		return;
	const double normalizedX = static_cast<double>(_aimX) / aimLength;
	const double normalizedY = static_cast<double>(_aimY) / aimLength;
	const double spawnDistance = static_cast<double>(g_game->getScale()) * _phaseThreeLaserSpawnDistance;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _phaseThreeLaserSpeed;
	const int	spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * spawnDistance);
	const int 	spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * spawnDistance);
	const int	velocityX = static_cast<int>(normalizedX * projectileVelocity);
	const int	velocityY = static_cast<int>(normalizedY * projectileVelocity);
	g_game->spawnEntity(
		new BossLaserProjectileEntity(
			spawnX,
			spawnY,
			velocityX,
			velocityY,
			_id,
			_phaseThreeLaserDamage
		)
	);
}

bool	LordGoobEntity::tick( void ) {
	if (_attackCooldown > 0)
		_attackCooldown--;
	if (_attackFrame >= 0)
	{
		if (_currentPhase == 1)
			return _tickPhaseOneAttack();
		if (_currentPhase == 2)
			return _tickPhaseTwoAttack();
		return _tickPhaseThreeAttack();
	}
	const int newPhase = _getPhase();
	bool phaseChanged = false;
	if (newPhase != _currentPhase)
	{
		_currentPhase = newPhase;
		_attackCooldown = 0;
		phaseChanged = true;
		if (_currentPhase == 2)
			_phaseTwoPattern = 0;
		if (_currentPhase == 3)
			_phaseThreePattern = 0;
		_state["phase"] = _currentPhase;
	}
	AbstractEntity* nearest = g_game->getNearestEntityOfType(EntityTypes::PLAYERENTITY, _posX, _posY);
	if (!nearest)
		return phaseChanged;
	const unsigned int distanceToPlayer = nearest->distance(_posX, _posY);
	const unsigned int attackRange = static_cast<unsigned int>(static_cast<float>(g_game->getScale()) * _attackRange);
	if (distanceToPlayer <= attackRange && _attackCooldown == 0)
	{
		if (_currentPhase == 1)
			_startPhaseOneAttack(nearest);
		else if (_currentPhase == 2)
			_startPhaseTwoAttack(nearest);
		else
			_startPhaseThreeAttack(nearest);
		if (_attackFrame >= 0)
			return true;
	}
	return phaseChanged;
}
