#include "AbstractMovingEntity.hpp"
#include <GameEngine.hpp>

const float	AbstractMovingEntity::_velCap = .2f;

AbstractMovingEntity::AbstractMovingEntity( EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, bool passableHitBox):
	AbstractEntity(type, size, posX, posY, health, passableHitBox)
{
	_velX = velX;
	_velY = velY;
}

AbstractMovingEntity::~AbstractMovingEntity( void ) {}

bool AbstractMovingEntity::tick( void ) { return false; }
void AbstractMovingEntity::setVelX( int velX ) { _velX = velX; }
void AbstractMovingEntity::setVelY( int velY ) { _velY = velY; }

bool AbstractMovingEntity::_templateTick( void )
{
	if (_velX == 0 && _velY == 0)
		return false;
	if (_passableHitBox)
	{
		_posX += _velX;
		_posY += _velY;
		return true;
	}

	const int velY = _velY;
	_velY = 0;
	if (_velX != 0 && g_game->checkCollision(this))
		_velX = 0;
	_posX += _velX;

	const int velX = _velX;
	_velX = 0;
	_velY = velY;
	if (_velY != 0 && g_game->checkCollision(this))
		_velY = 0;
	_posY += _velY;
	_velX = velX;

	return true;
}
