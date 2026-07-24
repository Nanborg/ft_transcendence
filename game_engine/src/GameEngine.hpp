#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <list>
#include <map>
#include <queue>
#include <iostream>
#include <memory>
#include <algorithm>
#include <chrono>
#include "ControllerIO.hpp"
#include "AbstractEntity.hpp"
#include "json.hpp"

#include "PlayerEntity.hpp"
#include "WallEntity.hpp"

enum inputTypes_e {
	PING = 0,
	JOIN = 1,
	LEAVE = 2,
	MOVE = 3,
	BUILD = 4,
	DELETE = 5,
	R_CREATE = 6,
	R_DESTROY = 7,
	R_START = 8,
	R_STOP = 9,
};

class GameEngine
{
public:
	typedef std::unique_ptr<AbstractEntity>	entityPtr_t;
	typedef std::list<entityPtr_t>			entityList_t;
	typedef std::map<int, int>				playerIds_t;
	typedef std::queue<json>				playerInput_t;

	GameEngine( const std::string& roomId );
	~GameEngine( void );

	bool	checkCollision( AbstractEntity* entity ) const;

	entityList_t::iterator	getEntityIterator( int entityId );
	AbstractEntity*			spawnNewEntity( int typeId, int posX, int posY, int velX, int velY );
	void					deleteEntity( entityList_t::iterator it );

	void	sendEntityUpdate( const AbstractEntity* entity );
	void	sendEntityDelete( const AbstractEntity* entity );

	void	manageInput( const json& in );
	void	pushInput( const json& in);

	bool	isRunning( void ) const;

	int		newId( void );
	void	init( void );
	void	start( void );
	void	stop( void );
	void	tick( void );

private:

	void	_loop_processInputs( void );
	void	_loop_tickEntities( void );

	void	_input_ping( const json& in );
	void	_input_join( const json& in );
	void	_input_leave( const json& in );
	void	_input_move( const json& in );
	void	_input_build( const json& in );
	void	_input_delete( const json& in );

	bool				_running;
	unsigned int		_nextEntityId, _tick;
	entityList_t		_entities;
	playerIds_t			_playerIds;
	playerInput_t		_playerInputs;
	const std::string	_roomId;
};

extern int			g_uspt;
extern GameEngine*	g_game;

#endif
