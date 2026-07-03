#include "AbstractMovingEntity.hpp"

AbstractMovingEntity::AbstractMovingEntity( int id, int size, int posX, int posY, int velX, int velY ): AbstractEntity(id, size, posX, posY), _velX(velX), _velY(velY) {}
AbstractMovingEntity::~AbstractMovingEntity( void ) {}

bool AbstractMovingEntity::tick( void ) { std::cout << "AbstractMovingEntity::tick\n"; return false; }
bool AbstractMovingEntity::_templateTick( void ) { _posX += _velX; _posY += _velY; return false; }

int AbstractMovingEntity::getVelX( void ) const { return _velX; }
int AbstractMovingEntity::getVelY( void ) const { return _velY; }

void AbstractMovingEntity::setVelX( int velX ) { _velX = velX; }
void AbstractMovingEntity::setVelY( int velY ) { _velY = velY; }
