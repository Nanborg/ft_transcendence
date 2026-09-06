#ifndef ABSTRACTMOVINGENTITY_HPP
#define ABSTRACTMOVINGENTITY_HPP

#include <AbstractEntity.hpp>
#include <enumEntityTypes.h>

class AbstractMovingEntity: public AbstractEntity
{
public:
	AbstractMovingEntity( EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, bool passableHitBox );
	virtual ~AbstractMovingEntity( void ) = 0;

	virtual bool	tick( void ) override;

	void	setVelX( int velX );
	void	setVelY( int velY );

	protected:
	virtual bool	_templateTick( void );

	static const float	_velCap;
};

#endif
