#ifndef ABSTRACT_HPP
#define ABSTRACT_HPP
#include <cstdint>
#include <enumEntityTypes.h>
#include <json.hpp>

#define INVINCIBLE_HEALTH (0x7FFFFFFF)

using namespace nlohmann;

class AbstractEntity
{
public:
	AbstractEntity( EntityTypes type, int size, int posX, int posY, int health, bool passableHitBox, int gold = 100);
	virtual ~AbstractEntity( void ) = 0;

	// write override tick behavior here
	// return true to send updates to client
	virtual bool tick( void );


	bool doTick( void );

	// true means collision, false means no collision
	bool checkCollision( const AbstractEntity& ) const;

	json	toJson( void ) const;

	unsigned int getId( void ) const;
	unsigned int getType( void ) const;
	int 	getSize( void ) const;
	int 	getPosX( void ) const;
	int 	getPosY( void ) const;
	int		getVelX( void ) const;
	int		getVelY( void ) const;
	int		getHealth( void ) const;
	int		getGold( void ) const;
	bool	getPassableHitBox( void ) const;

	void	setSize( int size );
	void	setPosX( int posX );
	void	setPosY( int posY );
	void	setHealth( int health );
	void	setGold( int gold );
	void	setPassableHitBox( bool passableHitBox );

	unsigned int	distance( int posX, int posY ) const;

	protected:
	virtual bool _templateTick( void );

	json				_state;
	const unsigned int	_id, _typeId;
	int					_size, _posX, _posY, _velX, _velY, _health, _gold;
	bool				_passableHitBox;
};

#endif
