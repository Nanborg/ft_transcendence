#ifndef CHECKPOINTENTITY_HPP
#define CHECKPOINTENTITY_HPP

#include <AbstractEntity.hpp>

class CheckpointEntity: public AbstractEntity
{
public:
	CheckpointEntity( int posX, int posY );
	~CheckpointEntity();
};

#endif
