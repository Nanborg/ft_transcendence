#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <list>
#include <map>
#include <queue>
#include <iostream>
#include <memory>
#include <typeinfo>
#include <algorithm>
#include <chrono>
#include "ControllerIO.hpp"
#include "AbstractEntity.hpp"
#include "json.hpp"

#include "PlayerEntity.hpp"
#include "WallEntity.hpp"

class GameEngine
{
public:
	GameEngine( int port );
	~GameEngine( void );

	bool	checkCollision( AbstractEntity* entity ) const;

	AbstractEntity*	spawnNewEntity( int typeId, int posX, int posY, int velX, int velY );
	void			deleteEntity( int entityId );

	void	sendEntityUpdate( const AbstractEntity* entity );
	void	sendEntityDelete( const AbstractEntity* entity );

	void	manageInput( const json& in );

	int		newId( void );
	void	init( void );
	void	start( void );
	void	stop( void );

	private:
	typedef std::unique_ptr<AbstractEntity>	entityPtr_t;
	typedef std::list<entityPtr_t>			entityList_t;
	typedef std::map<int, int>				playerIds_t;
	typedef std::queue<json>				playerInput_t;

	enum inputTypes_e {
		PING = 0,
		JOIN = 1,
		LEAVE = 2,
		MOVE = 3,
		BUILD = 4,
		DELETE = 5,
	};

	void	_loop_receiveMessages( void );
	void	_loop_processInputs( void );
	void	_loop_tickEntities( void );

	void	_input_ping( const json& in );
	void	_input_join( const json& in );
	void	_input_leave( const json& in );
	void	_input_move( const json& in );
	void	_input_build( const json& in );
	void	_input_delete( const json& in );

	ControllerIO				_io;
	bool						_running;
	int							_nextEntityId;
	entityList_t				_entities;
	playerIds_t					_playerIds;
	playerInput_t				_playerInputs;
	unsigned int				_uspt;
	static const unsigned int	_target_uspt;
};

extern GameEngine *g_game;
#endif
