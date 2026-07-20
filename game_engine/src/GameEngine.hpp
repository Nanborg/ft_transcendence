#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <string>
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
	private:
	typedef std::unique_ptr<AbstractEntity>	entityPtr_t;
	typedef std::list<entityPtr_t>			entityList_t;
	typedef std::map<int, int>				playerIds_t;
	typedef std::queue<json>				playerInput_t;

	struct GameSession
	{
		entityList_t	entities;
		playerIds_t		playerIds;
	};

	typedef std::map<std::string, GameSession> gameSessions_t ;
	void	spawnNewEntity( const std::string& gameId, GameSession& game, int typeId, float posX, float posY, float velX, float velY );
	public:
	GameEngine( int port );
	~GameEngine( void );

	bool	checkCollision( AbstractEntity* entity ) const;

	void	deleteEntity( const std::string& gameId, GameSession &game, int entityId );

	void	sendEntityUpdate( const std::string& gameId, const AbstractEntity* entity );
	void	sendEntityDelete( const std::string& gameId, const AbstractEntity* entity );

	void	manageInput( const json& in );

	int		newId( void );
	void	init( void );
	void	start( void );
	void	stop( void );

	private:
	enum inputTypes_e {
		PING = 0,
		JOIN = 1,
		LEAVE = 2,
		MOVE = 3,
		BUILD = 4,
		DELETE = 5,
	};

	GameSession*	_getGameSession( const std::string& gameId );
	GameSession&	_getOrCreateGameSession( const std::string& gameId );
	bool			_getGameId( const json& in, std::string& gameId ) const;
	AbstractEntity*	_findEntity( GameSession& game, int entityId );
	PlayerEntity*	_findPlayer( GameSession& game, int playerId );

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
	gameSessions_t				_games;
	playerInput_t				_playerInputs;
	unsigned int				_uspt;
	static const unsigned int	_target_uspt;
};

extern GameEngine *g_game;
#endif
