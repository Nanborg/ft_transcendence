#include "AbstractEntity.hpp"
#include "GameEngine.hpp"
#include <iostream>

AbstractEntity::AbstractEntity( unsigned int type, int size, int posX, int posY ): _typeId(type), _id(g_game->newId()), _size(size), _posX(posX), _posY(posY) {};
AbstractEntity::~AbstractEntity( void ) {}

bool AbstractEntity::tick( void ) { std::cout << "AbstractEntity::tick\n"; return false; }
bool AbstractEntity::_templateTick( void ) { return false; }

bool AbstractEntity::doTick( void ) {
	bool a, b;
	a = _templateTick();
	b = tick();
	return a | b;
}

bool AbstractEntity::checkCollision( const AbstractEntity& o ) const {
	int diffX = _posX - o._posX, diffY = _posY - o._posY, dist = _size + o._size;

	diffX = abs(diffX);
	diffY = abs(diffY);
	return (diffX < dist) && (diffY < dist);
}

unsigned int AbstractEntity::getId( void ) const { return _id; }
unsigned int AbstractEntity::getType( void ) const { return _typeId; }
int AbstractEntity::getSize( void ) const { return _size; }
int AbstractEntity::getPosX( void ) const { return _posX; }
int AbstractEntity::getPosY( void ) const { return _posY; }

void AbstractEntity::setSize( int size ) { _size = size; }
void AbstractEntity::setPosX( int posX ) { _posX = posX; }
void AbstractEntity::setPosY( int posY ) { _posY = posY; }
