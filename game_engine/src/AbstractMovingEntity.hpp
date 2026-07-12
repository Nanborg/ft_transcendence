#ifndef ABSTRACTMOVINGENTITY_HPP
#define ABSTRACTMOVINGENTITY_HPP

#include <iostream>
#include "AbstractEntity.hpp"

class AbstractMovingEntity: public AbstractEntity
{
public:
	AbstractMovingEntity( unsigned int type, int size, int posX, int posY, int velX, int velY, int health, int passableHitBox );
	virtual ~AbstractMovingEntity( void ) = 0;

	virtual bool	tick( void ) override;

	void	setVelX( int velX );
	void	setVelY( int velY );

	protected:
	virtual bool	_templateTick( void );
};

#endif
