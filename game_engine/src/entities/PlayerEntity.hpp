#ifndef PLAYERENTITY_HPP
#define PLAYERENTITY_HPP

#include <AbstractMovingEntity.hpp>
#include <GameEngine.hpp>
#include <json.hpp>

class PlayerEntity: public AbstractMovingEntity
{
public:
	PlayerEntity( int playerId, int posX, int posY, int velX, int velY );
	~PlayerEntity( void );

	bool	tick( void );
	void	movementInput( int velX, int velY );
	void	playerAction( const json& in );

private:

	void	_action_melee( const json& in );
	void	_action_range( const json& in );
	void	_action_shield( const json& in );
	void	_finish_shield( void );
	void	_check_shield_state( void );

	const int			_playerId;
	bool				_receivedInput;
	PlayerActions		_curAction;
	int					_shieldEntityId;

	static const float	_slashDist;
	static const int	_meleeCooldownTicks;
	static const int	_rangedCooldownTicks;
	static const int	_shieldCooldownTicks;
	static const int	_shieldBaseHealth;
	static const int	_shieldHealthPerLevel;
};

#endif
