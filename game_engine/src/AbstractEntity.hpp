#ifndef ABSTRACT_HPP
#define ABSTRACT_HPP
#include <cstdint>

class AbstractEntity
{
public:
	AbstractEntity( unsigned int type, int size, int posX, int posY, int health, bool passableHitBox );
	virtual ~AbstractEntity( void ) = 0;

	// write override tick behavior here
	// return true to send updates to client
	virtual bool tick( void );

	bool doTick( void );

	// true means collision, false means no collision2
	bool checkCollision( const  AbstractEntity& ) const;

	unsigned int getId( void ) const;
	unsigned int getType( void ) const;
	int 	getSize( void ) const;
	int 	getPosX( void ) const;
	int 	getPosY( void ) const;
	int		getVelX( void ) const;
	int		getVelY( void ) const;
	int		getHealth( void ) const;
	bool	getPassableHitBox( void ) const;


	void	setSize( int size );
	void	setPosX( int posX );
	void	setPosY( int posY );
	void	setHealth( int posY );
	void	setPassableHitBox( bool passableHitBox );

	protected:
	virtual bool _templateTick( void );

	const unsigned int	_id, _typeId;
	int					_size, _posX, _posY, _velX, _velY, _health;
	bool				_passableHitBox;
};

// add entries here for all new entity types
enum EntityTypes {
	NOENTITY = 0,
	PLAYERENTITY = 1,
	WALLENTITY = 2,
};

#endif
