#ifndef ABSTRACTMOVINGENTITY_HPP
#define ABSTRACTMOVINGENTITY_HPP

#include "GameEngine.hpp"
#include "AbstractEntity.hpp"

class AbstractMovingEntity: private AbstractEntity
{
public:
	AbstractMovingEntity( int id, int size, int posX, int posY, int velX, int velY );
	virtual ~AbstractMovingEntity( void ) = 0;

	virtual bool tick( void ) override;

	int getVelX( void ) const;
	int getVelY( void ) const;

	void setVelX( int velX );
	void setVelY( int velY );

protected:
	virtual bool _templateTick( void );
	int _velX, _velY;
};


#endif
