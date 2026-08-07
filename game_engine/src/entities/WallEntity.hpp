#ifndef WALLENTITY_HPP
#define WALLENTITY_HPP

#include <AbstractEntity.hpp>
#include <GameEngine.hpp>

class WallEntity: public AbstractEntity
{
public:
	WallEntity( int posX, int posY );
	~WallEntity( void );
};

#endif
