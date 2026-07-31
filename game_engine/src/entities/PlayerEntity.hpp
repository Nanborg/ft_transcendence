#ifndef PLAYERENTITY_HPP
#define PLAYERENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class PlayerEntity: public AbstractMovingEntity
{
public:
	PlayerEntity( int playerId, int posX, int posY, int velX, int velY );
	~PlayerEntity( void );

	bool	tick( void );
	void	movementInput( int velX, int velY );

private:
	const int		_playerId;
	bool			_receivedInput;
};

#endif
