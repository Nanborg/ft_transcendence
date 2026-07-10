#include "AbstractEntity.hpp"
#include "GameEngine.hpp"
#include <iostream>

AbstractEntity::AbstractEntity( unsigned int type, int size, int posX, int posY, int health, bool passableHitBox ):
	_typeId(type),
	_id(g_game->newId()),
	_size(size),
	_posX(posX),
	_posY(posY),
	_velX(0),
	_velY(0),
	_health(health),
	_passableHitBox(passableHitBox) {}

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
	int diffX = _posX - o._posX, diffY = _posY - o._posY, dist = _size + o._size;
	long dist2 = diffX*diffX + diffY*diffY, min = dist*dist;

	return dist2 < min;
}

unsigned int AbstractEntity::getId( void ) const { return _id; }
unsigned int AbstractEntity::getType( void ) const { return _typeId; }

int AbstractEntity::getSize( void ) const { return _size; }
int AbstractEntity::getPosX( void ) const { return _posX; }
int AbstractEntity::getPosY( void ) const { return _posY; }
int AbstractEntity::getVelX( void ) const { return _velX; }
int AbstractEntity::getVelY( void ) const { return _velY; }
int AbstractEntity::getHealth( void ) const { return _health; }
int AbstractEntity::getPassableHitBox( void ) const { return _passableHitBox; }

void AbstractEntity::setSize( int size ) { _size = size; }
void AbstractEntity::setPosX( int posX ) { _posX = posX; }
void AbstractEntity::setPosY( int posY ) { _posY = posY; }
void AbstractEntity::setHealth( int health ) { _health = health; }
void AbstractEntity::setPassableHitBox( int passableHitBox ) { _passableHitBox = passableHitBox; }
