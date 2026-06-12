#ifndef ABSTRACT_HPP
#define ABSTRACT_HPP

class AbstractEntity
{
public:
	AbstractEntity( int );
	virtual ~AbstractEntity( void ) = 0;

	virtual void tick( void );

	// true means collision, false means no collision
	bool checkCollision( const  AbstractEntity& ) const;

	int getPosX( void ) const;
	int getPosY( void ) const;
	int getSize( void ) const;
	int getId( void ) const;

	void setPosX( int );
	void setPosY( int );
	void setSize( int );

protected:
	int _posX, _posY, _size, _id;
};

#endif
