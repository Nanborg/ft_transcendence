#ifndef SPAWNPOINTENTITY_HPP
#define SPAWNPOINTENTITY_HPP

#include <AbstractEntity.hpp>
#include <GameEngine.hpp>

class SpawnPointEntity: public AbstractEntity
{
public:
	SpawnPointEntity( int posX, int posY );
	~SpawnPointEntity();
};

#endif
