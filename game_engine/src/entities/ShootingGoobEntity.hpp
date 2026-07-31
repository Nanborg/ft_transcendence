#ifndef SHOOTINGGOOBENTITY_HPP
#define SHOOTINGGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class ShootingGoobEntity: public AbstractMovingEntity
{
public:
	ShootingGoobEntity( int posX, int posY);
	~ShootingGoobEntity();

	bool	tick( void ) override;

private:
	static const float	_fleeDist;
	static const float	_range;
};

#endif
