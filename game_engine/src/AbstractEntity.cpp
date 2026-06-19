#include "AbstractEntity.hpp"
#include <iostream>

AbstractEntity::AbstractEntity( int id, int size, int posX, int posY ): _id(id), _size(size), _posX(posX), _posY(posY) {};
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

	diffX *= -(diffX < 0);
	diffY *= -(diffY < 0);
	return (diffX < dist) && (diffY < dist);
}

int AbstractEntity::getId() const { return _id; }
int AbstractEntity::getSize() const { return _size; }
int AbstractEntity::getPosX() const { return _posX; }
int AbstractEntity::getPosY() const { return _posY; }

void AbstractEntity::setSize( int size ) { _size = size; }
void AbstractEntity::setPosX( int posX ) { _posX = posX; }
void AbstractEntity::setPosY( int posY ) { _posY = posY; }
