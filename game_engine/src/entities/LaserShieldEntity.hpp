#ifndef LASERSHIELDENTITY_HPP
#define LASERSHIELDENTITY_HPP

#include <AbstractHitboxEntity.hpp>
#include <GameEngine.hpp>

class LaserShieldEntity: public AbstractHitboxEntity {
public:
	LaserShieldEntity( int posX, int posY, int health, int ownerId, int damage );
	~LaserShieldEntity();

protected:
	bool _templateTick( void ) override;

private:
	const int	_max_health;
};


#endif
