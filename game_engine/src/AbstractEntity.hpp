#ifndef ABSTRACT_HPP
#define ABSTRACT_HPP
#include <cstdint>

class AbstractEntity
{
public:
	AbstractEntity( unsigned int type, int size, int posX, int posY );
	virtual ~AbstractEntity( void ) = 0;

	// write override tick behavior here
	// return true to send updates to client
	virtual bool tick( void );

	bool doTick( void );

	// true means collision, false means no collision2
	bool checkCollision( const  AbstractEntity& ) const;

	unsigned int getId( void ) const;
	unsigned int getType( void ) const;
	int getSize( void ) const;
	int getPosX( void ) const;
	int getPosY( void ) const;
	int	getVelX( void ) const;
	int	getVelY( void ) const;


	void	setSize( int size );
	void	setPosX( int posX );
	void	setPosY( int posY );

	protected:
	virtual bool _templateTick( void );

	const unsigned int	_id, _typeId;
	int					_size, _posX, _posY, _velX, _velY;
};

#endif
