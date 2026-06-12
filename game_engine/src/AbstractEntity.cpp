#include "AbstractEntity.hpp"

AbstractEntity::AbstractEntity( int id ): _id(id) {};

void AbstractEntity::tick( void ) {}

bool AbstractEntity::checkCollision( const AbstractEntity& o ) const {
	int diffX = _posX - o._posX, diffY = _posY - o._posY, dist = _size + o._size;

	diffX *= -(diffX < 0);
	diffY *= -(diffY < 0);
	return (diffX < dist) && (diffY < dist);
}

int AbstractEntity::getPosX() const { return _posX; }
int AbstractEntity::getPosY() const { return _posY; }
int AbstractEntity::getSize() const { return _size; }
int AbstractEntity::getId() const { return _id; }

void AbstractEntity::setPosX( int posX ) { _posX = posX; }
void AbstractEntity::setPosY( int posY ) { _posY = posY; }
void AbstractEntity::setSize( int size ) { _size = size; }
