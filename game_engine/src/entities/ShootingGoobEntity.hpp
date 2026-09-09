#ifndef SHOOTINGGOOBENTITY_HPP
#define SHOOTINGGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>

class ShootingGoobEntity: public AbstractMovingEntity
{
public:
	ShootingGoobEntity( int posX, int posY );
	~ShootingGoobEntity();

	bool	tick( void ) override;

private:
	void				_shoot( int diffX, int diffY );
	void				_updateDirection( int diffX, int diffY );

	int					_shootCooldown;
	int					_shootFrame;
	int					_dirX;
	int					_dirY;

	static const float	_fleeDist;
	static const float	_range;
	static const float	_fleeSpeed;
	static const float	_projectileSpeed;
	static const int	_projectileDamage;
	static const int	_shootCooldownTicks;
	static const int	_shootAnimationFrames;
};

#endif
