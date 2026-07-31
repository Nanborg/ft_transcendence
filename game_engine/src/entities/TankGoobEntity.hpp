#ifndef TANKGOOBENTITY_HPP
#define TANKGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class TankGoobEntity: public AbstractMovingEntity
{
public:
	TankGoobEntity( int posX, int posY );
	~TankGoobEntity( void );

	bool	tick( void ) override;
};

#endif
