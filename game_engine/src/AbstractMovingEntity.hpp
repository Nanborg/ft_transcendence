#ifndef ABSTRACTMOVINGENTITY_HPP
#define ABSTRACTMOVINGENTITY_HPP

#include <iostream>
#include "AbstractEntity.hpp"

class AbstractMovingEntity: public AbstractEntity
{
public:
	AbstractMovingEntity( unsigned int type, int size, int posX, int posY, int velX, int velY );
	virtual ~AbstractMovingEntity( void ) = 0;

	int		getVelX( void ) const;
	int		getVelY( void ) const;

	void	setVelX( int velX );
	void	setVelY( int velY );

	virtual bool	tick( void ) override;

protected:
	virtual bool	_templateTick( void );

	int	_velX, _velY;
};

#endif
