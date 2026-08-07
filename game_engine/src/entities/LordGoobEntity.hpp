#ifndef LORDGOOBENTITY_HPP
#define LORDGOOBENTITY_HPP

#include <AbstractEntity.hpp>
#include <GameEngine.hpp>

class LordGoobEntity: public AbstractEntity
{
public:
	LordGoobEntity( int posX, int posY );
	~LordGoobEntity( void );

	bool	tick( void ) override;
};

#endif
