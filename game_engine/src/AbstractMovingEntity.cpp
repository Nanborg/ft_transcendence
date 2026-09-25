#include "AbstractMovingEntity.hpp"
#include <GameEngine.hpp>
#include <algorithm>
#include <cmath>
#include <limits>

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
	if (!_passableHitBox && g_game->checkCollision(this)) {
		_velX = _velY = 0;
	}
	_posX += _velX;
	_posY += _velY;
	return true;
}

void AbstractMovingEntity::_navigateTo(int targetX, int targetY, int speed, int fleeDistance)
{
	const NavigationGrid& grid = g_game->getNavigationGrid();
	const int scale = g_game->getScale();
	if (_pathRetryTicks > 0)
		--_pathRetryTicks;

	int destinationX = targetX;
	int destinationY = targetY;
	if (fleeDistance > 0) {
		const double distance = std::hypot(static_cast<double>(_posX) - targetX,
		                                  static_cast<double>(_posY) - targetY);
		if (distance == 0) {
			_velX = _velY = 0;
			return;
		}
		const auto coordinate = [](double value) {
			return static_cast<int>(std::max(static_cast<double>(std::numeric_limits<int>::min()),
			                       std::min(static_cast<double>(std::numeric_limits<int>::max()), value)));
		};
		destinationX = coordinate(targetX + (static_cast<double>(_posX) - targetX) * fleeDistance / distance);
		destinationY = coordinate(targetY + (static_cast<double>(_posY) - targetY) * fleeDistance / distance);
	}

	const auto moveToward = [&](int x, int y) {
		const double dx = static_cast<double>(x) - _posX;
		const double dy = static_cast<double>(y) - _posY;
		const double distance = std::hypot(dx, dy);
		if (distance <= speed) {
			_velX = x - _posX;
			_velY = y - _posY;
		} else {
			_velX = static_cast<int>(dx * speed / distance);
			_velY = static_cast<int>(dy * speed / distance);
		}
	};
	moveToward(destinationX, destinationY);
	if (grid.canTravel(_posX, _posY, destinationX, destinationY, _size) &&
	    grid.canTravel(_posX, _posY, _posX + _velX, _posY + _velY, _size)) {
		_path.clear();
		_pathIndex = 0;
		return;
	}

	const bool reachedWaypoint = _pathIndex < _path.size() &&
		_posX == _path[_pathIndex].first && _posY == _path[_pathIndex].second;
	const bool targetChanged = _pathTargetCol != targetX / scale || _pathTargetRow != targetY / scale;
	if (_pathRetryTicks == 0 && (_pathIndex >= _path.size() || (targetChanged && reachedWaypoint))) {
		_path = grid.findPath(_posX, _posY, targetX, targetY, fleeDistance);
		_pathIndex = 0;
		_pathTargetCol = targetX / scale;
		_pathTargetRow = targetY / scale;
		_pathRetryTicks = 5;
	}
	while (_pathIndex < _path.size() && _posX == _path[_pathIndex].first &&
	       _posY == _path[_pathIndex].second)
		++_pathIndex;
	if (_pathIndex >= _path.size()) {
		_velX = _velY = 0;
		return;
	}
	moveToward(_path[_pathIndex].first, _path[_pathIndex].second);
}
