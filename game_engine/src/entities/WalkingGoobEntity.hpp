#ifndef WALKINGGOOBENTITY_HPP
#define WALKINGGOOBENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>

class WalkingGoobEntity: public AbstractMovingEntity
{
public:
	WalkingGoobEntity( int posX, int posY );
	~WalkingGoobEntity( void );

	bool	tick( void ) override;
	bool	canPassThroughPlayer( void ) const;
private:
	void				_start_attack( const AbstractEntity* target );
	bool				_tick_attack( void );
	int					_targetEntityId;
	int					_attackFrame;
	int					_attackCooldown;
	int					_attackDirX;
	int					_attackDirY;

	static const float	_aggroRange;
	static const float	_aggroLose;
	static const float	_attackRange;
	static const float	_moveSpeed;
	static const float	_chargeSpeed;
	static const int	_attackDamage;
	static const int	_attackCooldownTicks;
};

#endif
