#ifndef LASERPROJECTILEENTITY_HPP
#define LASERPROJECTILEENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class LaserProjectileEntity: public AbstractHitboxEntity {
public:
	// velocity vector `v = (velX, velY)` must have a length of `g_game->getScale()`
	LaserProjectileEntity( int posX, int posY, int velX, int velY, int ownerId, int damage );
	~LaserProjectileEntity( void );
private:
	static const float	_speed;
	static const int	_lifetimeTicks;
};

#endif
