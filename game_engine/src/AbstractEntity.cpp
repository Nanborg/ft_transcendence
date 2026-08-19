#include "AbstractEntity.hpp"
#include "GameEngine.hpp"
#include <iostream>

AbstractEntity::AbstractEntity( EntityTypes type, int size, int posX, int posY, int health, bool passableHitBox, int gold ):
	_typeId(type),
	_id(g_game->newId()),
	_size(size),
	_posX(posX),
	_posY(posY),
	_velX(0),
	_velY(0),
	_health(health),
	_passableHitBox(passableHitBox),
	_gold(gold) {}

AbstractEntity::~AbstractEntity( void ) {}

bool AbstractEntity::tick( void ) { return false; }
bool AbstractEntity::_templateTick( void ) { return false; }

bool AbstractEntity::doTick( void ) {
	bool a, b;
	a = _templateTick();
	b = tick();
	return a | b;
}

bool AbstractEntity::checkCollision( const AbstractEntity& o ) const {
	int dist = (_size + o._size) / 2;
	return o.distance(_posX, _posY) < dist;
}

json AbstractEntity::toJson( void ) const {
	json entityJson;

	entityJson["entityId"] = _id;
	entityJson["typeId"] = _typeId;
	entityJson["posX"] = _posX;
	entityJson["posY"] = _posY;
	entityJson["velX"] = _velX;
	entityJson["velY"] = _velY;
	entityJson["health"] = _health;
	entityJson["gold"] = _gold;
	entityJson["state"] = _state;

	return entityJson;
}

unsigned int AbstractEntity::getId( void ) const { return _id; }
unsigned int AbstractEntity::getType( void ) const { return _typeId; }

int		AbstractEntity::getSize( void ) const { return _size; }
int		AbstractEntity::getPosX( void ) const { return _posX; }
int		AbstractEntity::getPosY( void ) const { return _posY; }
int		AbstractEntity::getVelX( void ) const { return _velX; }
int		AbstractEntity::getVelY( void ) const { return _velY; }
int		AbstractEntity::getHealth( void ) const { return _health; }
int		AbstractEntity::getGold( void ) const { return _gold; }
bool	AbstractEntity::getPassableHitBox( void ) const { return _passableHitBox; }

void	AbstractEntity::setSize( int size ) { _size = size; }
void	AbstractEntity::setPosX( int posX ) { _posX = posX; }
void	AbstractEntity::setPosY( int posY ) { _posY = posY; }
void	AbstractEntity::setHealth( int health ) { _health = health; }
void	AbstractEntity::setGold( int gold ) { _gold = gold; }
void	AbstractEntity::setPassableHitBox( bool passableHitBox ) { _passableHitBox = passableHitBox; }

unsigned int AbstractEntity::distance( int posX, int posY ) const {
	long diffX = _posX - posX, diffY = _posY - posY;
	long dist2 = diffX*diffX + diffY*diffY;
	return (sqrtl(dist2));
}
