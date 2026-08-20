#include "ShootingGoobEntity.hpp"

const float	ShootingGoobEntity::_fleeDist = 5.f;
const float	ShootingGoobEntity::_range = 10.f;
const float ShootingGoobEntity::_fleeSpeed = 0.15f;
const float ShootingGoobEntity::_projectileSpeed = 0.5f;
const int	ShootingGoobEntity::_projectileDamage = 1;
const int	ShootingGoobEntity::_shootCooldownTicks = 20;
const int	ShootingGoobEntity::_shootAnimationFrames = 4;

ShootingGoobEntity::ShootingGoobEntity( int posX, int posY ):
	AbstractMovingEntity(EntityTypes::SHOOTINGGOOB, g_game->getScale(), posX, posY, 0, 0, 100, false), _shootCooldown(0), _shootFrame(-1), _dirX(0), _dirY(1)
{
	_state["action"] = "idle";
	_state["shootFrame"] = -1;
	_state["dirX"] = _dirX;
	_state["dirY"] = _dirY;
}

ShootingGoobEntity::~ShootingGoobEntity( void ) {}

void ShootingGoobEntity::_updateDirection (const AbstractEntity* target)
{
	const long dx = target->getPosX() - _posX;
	const long dy = target->getPosY() - _posY;

	if (dx == 0 && dy == 0)
		return;

	const long absDx = dx < 0 ? -dx : dx;
	const long absDY = dy < 0 ? -dy : dy;
	if (absDx > absDY)
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

void ShootingGoobEntity::_shoot( const AbstractEntity* target )
{
        const long dx = target->getPosX() - _posX;
        const long dy = target->getPosY() - _posY;
        const unsigned int dist = target->distance(_posX, _posY);

        if (dist == 0)
                return;

        const double velocityScale =
                static_cast<double>(g_game->getScale()) *
                _projectileSpeed /
                static_cast<double>(dist);

        const int projectileVelX = static_cast<int>(
                static_cast<double>(dx) * velocityScale
        );
        const int projectileVelY = static_cast<int>(
                static_cast<double>(dy) * velocityScale
        );

		const double scale = static_cast<double>(g_game->getScale());
		long muzzlePosX = _posX;
		long muzzlePosY = _posY;
		if (_dirX < 0)
		{
			muzzlePosX -= static_cast<long>(scale * 0.55);
			muzzlePosY -= static_cast<long>(scale * 0.65);
		}
		else if (_dirX > 0)
		{
			muzzlePosX += static_cast<long>(scale * 0.55);
			muzzlePosY -= static_cast<long>(scale * 0.65);
		}
		else if (_dirY < 0)
			muzzlePosY -= static_cast<long>(scale * 1.15);
		else
		{
			muzzlePosX -= static_cast<long>(scale * 0.28);
			muzzlePosY -= static_cast<long>(scale * 0.45);
		}

        g_game->spawnEntity(
                new EnemyProjectileEntity(
                        muzzlePosX,
                        muzzlePosY,
                        projectileVelX,
                        projectileVelY,
                        _id,
                        _projectileDamage
                )
        );

        _shootCooldown = _shootCooldownTicks;
		_shootFrame = 0;
		_state["action"] = "shoot";
		_state["shootFrame"] = _shootFrame;
}

bool ShootingGoobEntity::tick( void )
{
	const int oldShootFrame = _shootFrame;

	if (_shootFrame >= 0)
	{
		_shootFrame++;
		if (_shootFrame >= _shootAnimationFrames)
		{
			_shootFrame = -1;
			_state["action"] = "idle";
			_state["shootFrame"] = -1;
		}
		else
		{
			_state["shootFrame"] = _shootFrame;
		}
	}
    if (_shootCooldown > 0)
            _shootCooldown--;
    AbstractEntity* nearest =
            g_game->getNearestEntityOfType(
                    EntityTypes::PLAYERENTITY,
                    _posX,
                    _posY
            );
    if (!nearest)
    {
		const bool animationChanged = oldShootFrame != _shootFrame;
        const bool wasMoving = _velX != 0 || _velY != 0;
        _velX = 0;
        _velY = 0;
        return wasMoving || animationChanged;
    }

	const int oldDirX = _dirX;
	const int oldDirY = _dirY;
	_updateDirection(nearest);
    const unsigned int dist =
            nearest->distance(_posX, _posY);
    const int oldVelX = _velX;
    const int oldVelY = _velY;
    const unsigned int fleeDistance =
            static_cast<unsigned int>(
                    static_cast<float>(g_game->getScale()) *
                    _fleeDist
            );
    if (dist < fleeDistance && dist != 0)
    {
            const long dx = _posX - nearest->getPosX();
            const long dy = _posY - nearest->getPosY();

            const double velocityScale =
                    static_cast<double>(g_game->getScale()) *
                    _fleeSpeed /
                    static_cast<double>(dist);

            _velX = static_cast<int>(
                    static_cast<double>(dx) * velocityScale
            );
            _velY = static_cast<int>(
                    static_cast<double>(dy) * velocityScale
            );
    }
    else
    {
            _velX = 0;
            _velY = 0;
    }
    const unsigned int attackRange =
            static_cast<unsigned int>(
                    static_cast<float>(g_game->getScale()) *
                    _range
            );
    if (dist <= attackRange && _shootCooldown == 0)
            _shoot(nearest);
	const bool velocityChanged = oldVelX != _velX || oldVelY != _velY;
	const bool directionChanged = oldDirX != _dirX || oldDirY != _dirY;
	const bool animationChanged = oldShootFrame != _shootFrame;

	return velocityChanged || directionChanged || animationChanged;
}