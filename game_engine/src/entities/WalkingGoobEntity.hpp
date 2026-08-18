#ifndef WALKINGGOOBENTITY_HPP
#define WALKINGGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class WalkingGoobEntity: public AbstractMovingEntity
{
public:
	WalkingGoobEntity( int posX, int posY );
	~WalkingGoobEntity( void );

	bool	tick( void ) override;
private:
	int					_targetEntityId;

	static const float	_aggroRange;
	static const float	_aggroLose;
};

#endif
