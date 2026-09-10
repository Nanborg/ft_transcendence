#include "LordGoobEntity.hpp"
#include "BossLaserProjectileEntity.hpp"
#include <cmath>

const float		LordGoobEntity::_attackRange = 18.f;
const float		LordGoobEntity::_projectileSpeed = 0.35f;
const float		LordGoobEntity::_projectileSpawnDistance = 1.2f;
const int		LordGoobEntity::_projectileDamage = 6;
const int		LordGoobEntity::_attackCooldownTicks = 25;
const int		LordGoobEntity::_attackFrameDurationTicks = 3;
const int		LordGoobEntity::_attackFrameCount = 4;
const float		LordGoobEntity::_projectileSpread = 0.20;
const int		LordGoobEntity::_phaseTwoCooldownTicks = 20;
const int		LordGoobEntity::_phaseTwoFrameCount = 6;
const int		LordGoobEntity::_phaseTwoFrameDurationTicks = 3;
const int		LordGoobEntity::_phaseTwoRadialProjectileCount = 8;
const float		LordGoobEntity::_phaseTwoFanSpread = 0.24;
const int		LordGoobEntity::_phaseThreeCooldownTicks = 15;
const int		LordGoobEntity::_phaseThreeFrameCount = 6;
const int		LordGoobEntity::_phaseThreeFrameDurationTicks = 3;
const int		LordGoobEntity::_phaseThreeRadialProjectileCount = 12;
const int		LordGoobEntity::_phaseThreeLaserDamage = 12;
const float		LordGoobEntity::_phaseThreeLaserSpeed = 0.22f;
const float		LordGoobEntity::_phaseThreeLaserSpawnDistance = 1.4f;
const float		LordGoobEntity::_phaseThreeFanAngleStep = 0.14;

LordGoobEntity::LordGoobEntity( int posX, int posY ):
	AbstractEntity(EntityTypes::LORDGOOB, g_game->getScale(), posX, posY, 10000, false), _targetEntityId(-1), _attackCooldown(0), _attackFrame(-1), _attackFrameTicks(0), _currentPhase(1), _phaseTwoPattern(0), _phaseThreePattern(0), _dirX(0), _dirY(1), _aimX(0), _aimY(1)
{
	_state["phase"] = 1;
	_state["action"] = "idle";
	_state["attackType"] = "idle";
	_state["attackFrame"] = -1;
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
}

LordGoobEntity::~LordGoobEntity( void ) {}

int	LordGoobEntity::_getPhase( void ) const {
	if (_health > 2000)
		return 1;
	if (_health > 1000)
		return 2;
	return 3;
}

void	LordGoobEntity::_updateDirection( int diffX, int diffY ) {
	if (diffX == 0 && diffY == 0)
		return;
	if (abs(diffX) > abs(diffY)) {
		_dirX = diffX < 0 ? -1 : 1;
		_dirY = 0;
	} else {
		_dirX = 0;
		_dirY = diffY < 0 ? -1 : 1;
	}
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
}

void	LordGoobEntity::_startPhaseOneAttack( const AbstractEntity* target ) {
	const int diffX = target->getPosX() - _posX;
	const int diffY = target->getPosY() - _posY;
	if (diffX == 0 && diffY == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = diffX;
	_aimY = diffY;
	_updateDirection(diffX, diffY);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 1;
	_state["action"] = "attack";
	_state["attackType"] = "magicFan";
	_state["attackFrame"] = _attackFrame;
}

static void	normalize(double &aimX, double &aimY) {
	if (aimX == 0 && aimY == 0)
		return;
	double len = std::sqrt(aimX * aimX + aimY * aimY);
	aimX /= len;
	aimY /= len;
}

void	LordGoobEntity::_fanAttack( float dist, float interval, float offset, float speed, int shots ) {
	double normalizedX = _aimX;
	double normalizedY = _aimY;
	normalize(normalizedX, normalizedY);
	double perpendicularX = -normalizedY;
	double perpendicularY = normalizedX;
	int spawnDistance = g_game->getScale() * dist;
	int scaledOffset = g_game->getScale() * offset;
	int projSpeed = g_game->getScale() * speed;
	float shotOffset = ((float)(shots) - 1.f) / 2.f;
	for (int i = 0; i < shots; i++) {
		float a = interval * ((float)i - shotOffset);
		float sideOffset = scaledOffset * ((float)i - shotOffset);
		float ca = std::cos(a);
		float sa = std::sin(a);
		int spawnX = _posX + normalizedX * spawnDistance + perpendicularX * sideOffset;
		int spawnY = _posY + normalizedY * spawnDistance + perpendicularY * sideOffset;
		int velX = (ca * normalizedX - sa * normalizedY) * projSpeed;
		int velY = (sa * normalizedX + ca * normalizedY) * projSpeed;
		g_game->spawnEntity(new BossProjectileEntity(spawnX, spawnY, velX, velY, _id, _projectileDamage));
	}
}

void	LordGoobEntity::_radialAttack( float speed, float dist, int shots ) {
	float interval = 2. * M_PI / (float) shots;
	_fanAttack(dist, interval, 0.f, speed, shots);
}

void	LordGoobEntity::_firePhaseOneAttack( void ) {
	_fanAttack(_projectileSpawnDistance, _projectileSpread, 0.45f, _projectileSpeed, 3);
}

bool	LordGoobEntity::_tickPhaseOneAttack(void) {
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
		_state["attackType"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void	LordGoobEntity::_startPhaseTwoAttack( const AbstractEntity* target ) {
	const int diffX = target->getPosX() - _posX;
	const int diffY = target->getPosY() - _posY;
	if (diffX == 0 && diffY == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = diffX;
	_aimY = diffY;
	_updateDirection(diffX, diffY);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 2;
	_state["action"] = "attack";
	_state["attackType"] = _phaseTwoPattern == 0 ? "cannonFan" : "radial";
	_state["attackFrame"] = _attackFrame;
	_state["attackPattern"] = _phaseTwoPattern;
}

bool	LordGoobEntity::_tickPhaseTwoAttack( void ) {
	const bool useMagicAnimation = _state["attackType"] == "radial";
	const int fireFrame = useMagicAnimation ? 2 : 4;
	const int frameCount = useMagicAnimation ? _attackFrameCount : _phaseTwoFrameCount;
	if (_attackFrame == fireFrame && _attackFrameTicks == 0)
		_firePhaseTwoAttack();
	_attackFrameTicks++;
	if (_attackFrameTicks < _phaseTwoFrameDurationTicks)
		return false;
	_attackFrameTicks = 0;
	_attackFrame++;
	if (_attackFrame >= frameCount)
	{
		_attackFrame = -1;
		_attackCooldown = _phaseTwoCooldownTicks;
		_targetEntityId = -1;
		_state["action"] = "idle";
		_state["attackType"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void	LordGoobEntity::_firePhaseTwoFan( void ) {
	_fanAttack(1.25f, _phaseTwoFanSpread, 0.65f, _projectileSpeed, 3);
}

void	LordGoobEntity::_firePhaseTwoRadial( void ) {

	_radialAttack(_projectileSpeed, 1.25f, _phaseTwoRadialProjectileCount);
}

void	LordGoobEntity::_firePhaseTwoAttack( void ) {
	switch (_phaseTwoPattern) {
	case 0:
		_firePhaseTwoFan();
		break;
	case 1:
		_firePhaseTwoRadial();
		break;
	default:
		break;
	}
	_phaseTwoPattern++;
	_phaseTwoPattern &= 1;
}

void	LordGoobEntity::_startPhaseThreeAttack( const AbstractEntity* target ) {
	const int diffX = target->getPosX() - _posX;
	const int diffY = target->getPosY() - _posY;
	if (diffX == 0 && diffY == 0)
		return;
	_targetEntityId = target->getId();
	_aimX = diffX;
	_aimY = diffY;
	_updateDirection(diffX, diffY);
	_attackFrame = 0;
	_attackFrameTicks = 0;
	_state["phase"] = 3;
	_state["action"] = "attack";
	if (_phaseThreePattern == 0)
		_state["attackType"] = "cannonFan";
	else if (_phaseThreePattern == 2)
		_state["attackType"] = "radial";
	else
		_state["attackType"] = "laser";
	_state["attackFrame"] = _attackFrame;
	_state["attackPattern"] = _phaseThreePattern;
}

bool	LordGoobEntity::_tickPhaseThreeAttack( void ) {
	const bool useMagicAnimation = _state["attackType"] == "radial";
	const int fireFrame = useMagicAnimation ? 2 : 4;
	const int frameCount = useMagicAnimation ? _attackFrameCount : _phaseThreeFrameCount;
	if (_attackFrame == fireFrame && _attackFrameTicks == 0)
		_firePhaseThreeAttack();
	_attackFrameTicks++;
	if (_attackFrameTicks < _phaseThreeFrameDurationTicks)
		return false;
	_attackFrameTicks = 0;
	_attackFrame++;
	if (_attackFrame >= frameCount)
	{
		_attackFrame = -1;
		_attackCooldown = _phaseThreeCooldownTicks;
		_targetEntityId = -1;
		_state["action"] = "idle";
		_state["attackType"] = "idle";
		_state["attackFrame"] = -1;
		return true;
	}
	_state["attackFrame"] = _attackFrame;
	return true;
}

void	LordGoobEntity::_firePhaseThreeFan( void ) {
	double normalizedX = static_cast<double>(_aimX);
	double normalizedY = static_cast<double>(_aimY);
	normalize(normalizedX, normalizedY);
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
		const double sideOffset = i % 2 == 0 ? -shoulderOffset : shoulderOffset;
		const int spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * spawnDistance + perpendicularX * sideOffset);
		const int spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * spawnDistance + perpendicularY * sideOffset);
		const int velocityX = static_cast<int>(rotatedX * projectileVelocity);
		const int velocityY = static_cast<int>(rotatedY * projectileVelocity);
		g_game->spawnEntity(new BossProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _projectileDamage));
	}
}

void	LordGoobEntity::_firePhaseThreeRadial( void ) {
	double normalizedX = static_cast<double>(_aimX);
	double normalizedY = static_cast<double>(_aimY);
	normalize(normalizedX, normalizedY);
	const double perpendicularX = -normalizedY;
	const double perpendicularY = normalizedX;
	const double forwardOffset = static_cast<double>(g_game->getScale()) * 0.5;
	const double shoulderOffset = static_cast<double>(g_game->getScale()) * 0.65;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _projectileSpeed;
	const double fullCircle = 2.0 * std::acos(-1.0);
	for (int i = 0; i < _phaseThreeRadialProjectileCount; i++) {
		const double angle = fullCircle * static_cast<double>(i) / static_cast<double>(_phaseThreeRadialProjectileCount);
		const double directionX = std::cos(angle);
		const double directionY = std::sin(angle);
		const double sideOffset = i % 2 == 0 ? -shoulderOffset : shoulderOffset;
		const int spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * forwardOffset + perpendicularX * sideOffset);
		const int spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * forwardOffset + perpendicularY * sideOffset);
		const int velocityX = static_cast<int>(directionX * projectileVelocity);
		const int velocityY = static_cast<int>(directionY * projectileVelocity);
		g_game->spawnEntity(new BossProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _projectileDamage));
	}
}

void	LordGoobEntity::_firePhaseThreeAttack( void ) {
	switch (_phaseThreePattern) {
	case 0:
		_firePhaseThreeFan();
		break;
	case 1:
		_firePhaseThreeLaser();
		break;
	case 2:
		_firePhaseThreeRadial();
		break;
	case 3:
		_firePhaseThreeLaser();
		break;
	default:
		break;
	}
	_phaseThreePattern++;
	_phaseThreePattern &= 3;
}

void	LordGoobEntity::_firePhaseThreeLaser( void ) {
	double normalizedX = static_cast<double>(_aimX);
	double normalizedY = static_cast<double>(_aimY);
	normalize(normalizedX, normalizedY);
	const double spawnDistance = static_cast<double>(g_game->getScale()) * _phaseThreeLaserSpawnDistance;
	const double projectileVelocity = static_cast<double>(g_game->getScale()) * _phaseThreeLaserSpeed;
	const int	spawnX = static_cast<int>(static_cast<double>(_posX) + normalizedX * spawnDistance);
	const int 	spawnY = static_cast<int>(static_cast<double>(_posY) + normalizedY * spawnDistance);
	const int	velocityX = static_cast<int>(normalizedX * projectileVelocity);
	const int	velocityY = static_cast<int>(normalizedY * projectileVelocity);
	g_game->spawnEntity(new BossLaserProjectileEntity(spawnX, spawnY, velocityX, velocityY, _id, _phaseThreeLaserDamage));
}

bool	LordGoobEntity::tick( void ) {
	if (_attackCooldown > 0)
		_attackCooldown--;
	if (_attackFrame >= 0) {
		switch (_currentPhase) {
		case 1:
			return _tickPhaseOneAttack();
		case 2:
			return _tickPhaseTwoAttack();
		case 3:
			return _tickPhaseThreeAttack();
		default:
			return false;
		}
	}
	const int newPhase = _getPhase();
	bool phaseChanged = newPhase != _currentPhase;
	if (phaseChanged) {
		_currentPhase = newPhase;
		_attackCooldown = 0;
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
	if (distanceToPlayer <= attackRange && _attackCooldown == 0) {
		switch (_currentPhase) {
			case 1:
				_startPhaseOneAttack(nearest);
				break;
			case 2:
				_startPhaseTwoAttack(nearest);
				break;
			case 3:
				_startPhaseThreeAttack(nearest);
				break;
			default:
				break;
		}
		return true;
	}
	return phaseChanged;
}
