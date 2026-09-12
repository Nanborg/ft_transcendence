#ifndef SPAWNPOINTENTITY_HPP
#define SPAWNPOINTENTITY_HPP

#include <AbstractEntity.hpp>

class SpawnPointEntity: public AbstractEntity
{
public:
	SpawnPointEntity( int posX, int posY );
	~SpawnPointEntity();
};

#endif
