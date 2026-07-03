#ifndef ABSTRACT_HPP
#define ABSTRACT_HPP

class AbstractEntity
{
public:
	AbstractEntity( int id, int size, int posX, int posY );
	virtual ~AbstractEntity( void ) = 0;

	// write override tick behavior here
	// return true to send updates to client
	virtual bool tick( void );

	bool doTick( void );

	// true means collision, false means no collision
	bool checkCollision( const  AbstractEntity& ) const;

	int getId( void ) const;
	int getSize( void ) const;
	int getPosX( void ) const;
	int getPosY( void ) const;

	void setSize( int );
	void setPosX( int );
	void setPosY( int );

protected:
	virtual bool _templateTick( void );

	const int	_id;
	int			_size, _posX, _posY;
};

#endif
