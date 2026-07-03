#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <forward_list>
#include <map>
#include <queue>
#include <iostream>
#include <memory>
#include <typeinfo>
#include <algorithm>
#include "ControllerIO.hpp"
#include "AbstractEntity.hpp"
#include "json.hpp"

#include "PlayerEntity.hpp"

class GameEngine
{
public:
	GameEngine( int port );
	~GameEngine( void );

	// list all used entity classes along with their type id for referral in other parts of the server
	static void		registerAllTypes( void );
	static uint8_t	registerEntityType( size_t hash_code, int id );

	void		manageInput( const json& in );
	void		sendEntityUpdate( const AbstractEntity* entity );

	static int	getTypeId( size_t hash_code );

	int		newId( void );
	void	init( void );
	void	start( void );
	void	stop( void );

	private:
	typedef std::unique_ptr<AbstractEntity>	entityPtr_t;
	typedef std::forward_list<entityPtr_t>	entityList_t;
	typedef std::map<size_t, int>			typeList_t;
	typedef std::map<int, int>				playerIds_t;
	typedef std::queue<json>				playerInput_t;

	enum inputTypes_e {
		PING = 0,
		JOIN = 1,
		LEAVE = 2,
		MOVE = 3
	};

	void			_input_ping( const json& in );
	void			_input_join( const json& in );
	void			_input_leave( const json& in );
	void			_input_move( const json& in );


	ControllerIO		_io;
	bool				_running;
	int					_nextEntityId;
	entityList_t		_entities;
	playerIds_t			_playerIds;
	playerInput_t		_playerInputs;
	static typeList_t	_knownTypes;
};

#define GET_TYPE(T) (GameEngine::getTypeId(typeid(T).hash_code()))
extern GameEngine *g_game;
#endif
