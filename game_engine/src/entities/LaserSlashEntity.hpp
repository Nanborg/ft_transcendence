#ifndef LASERSLASHENTITY_HPP
#define LASERSLASHENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class LaserSlashEntity: public AbstractHitboxEntity {
public:
	LaserSlashEntity( int posX, int posY, int ownerId, int damage );
	~LaserSlashEntity( void );
};

#endif
