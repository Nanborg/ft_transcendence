#ifndef ABSTRACTHITBOX_HPP
#define ABSTRACTHITBOX_HPP

#include <AbstractMovingEntity.hpp>

class AbstractHitboxEntity: public AbstractMovingEntity
{
public:
	AbstractHitboxEntity( EntityTypes type, int size, int posX, int posY, int velX, int velY, int health, int ownerId );
	virtual ~AbstractHitboxEntity() = 0;

	virtual bool	tick( void ) override;

protected:
	virtual bool	_templateTick( void );

	const int	_ownerId;
};

#endif
