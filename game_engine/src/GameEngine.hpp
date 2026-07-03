#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <forward_list>
#include <map>
#include <iostream>
#include <memory>
#include <typeinfo>
#include <algorithm>
#include "ControllerIO.hpp"
#include "AbstractEntity.hpp"

#include "PlayerEntity.hpp"

class GameEngine
{
public:
	GameEngine( int port );
	~GameEngine( void );

	// list all used entity classes along with their type id for referral in other parts of the server
	static void		registerAllTypes( void );
	static uint8_t	registerEntityType( size_t hash_code, int id );

	static void		manageInput( uint8_t buffer[16] );
	static int		getTypeId( size_t hash_code );

	int		newId( void );
	void	init( void );
	void	start( void );
	void	stop( void );

	private:
	typedef std::unique_ptr<AbstractEntity>	entityPtr;
	typedef std::forward_list<entityPtr>	entityList;
	typedef std::map<size_t, int>			typeList;
	typedef std::map<int, int>				playerIds;
	struct input {
		uint8_t	typeId;
		uint8_t	playerId;
		int		X;
		int		Y;
		uint8_t	*extra;
	};

	struct output {
		unsigned int	entityId;
		int				posX;
		int				posY;
		int				velX;
		int				velY;
		unsigned int	size;
		uint8_t			team;
		uint8_t			*extra;
	};

	void			_input_ping( input in );
	void			_input_join( input in );
	void			_input_leave( input in );
	void			_input_move( input in );


	ControllerIO	_io;
	bool			_running;
	int				_nextEntityId;
	entityList		_entities;
	playerIds		_playerIds;
	static typeList	_knownTypes;
};

#define GET_TYPE(T) (GameEngine::getTypeId(typeid(T).hash_code()))
extern GameEngine *g_game;
#endif
