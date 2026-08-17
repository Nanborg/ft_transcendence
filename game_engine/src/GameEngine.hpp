#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <list>
#include <map>
#include <queue>
#include <iostream>
#include <memory>
#include <algorithm>
#include <chrono>
#include <fstream>

#include <ControllerIO.hpp>
#include <AbstractEntity.hpp>
#include <json.hpp>
#include <enumInputTypes.h>

#include <entities/importEntities.h>

class GameEngine
{
public:
	typedef std::unique_ptr<AbstractEntity>	entityPtr_t;
	typedef std::list<entityPtr_t>			entityList_t;
	typedef std::map<int, int>				playerIds_t;
	typedef std::queue<json>				playerInput_t;
	typedef std::vector<json>				playerData_t;

	GameEngine( const std::string& roomId );
	~GameEngine( void );

	bool	checkCollision( AbstractEntity* entity ) const;

	AbstractEntity*			getNearestEntityOfType( int typeId, int posX, int posY );
	entityList_t::iterator	getEntityIterator( int entityId );
	AbstractEntity*			spawnNewEntity( int typeId, int posX, int posY, int velX, int velY );
	void					deleteEntity( entityList_t::iterator it );
	void					suffer_damage( void );

	void	sendEntityUpdate( const AbstractEntity* entity );
	void	sendEntityDelete( const AbstractEntity* entity );

	void	manageInput( const json& in );
	void	pushInput( const json& in );

	bool			isRunning( void ) const;
	unsigned int	getScale( void ) const;

	void	init( const json& in );

	int		newId( void );
	void	start( void );
	void	stop( const std::string &reason );
	void	tick( void );

	struct PlayerUpgrades {
        int melee;
        int ranged;
        int shield;
    };

    struct PlayerCooldowns {
        int melee;
        int ranged;
        int shield;
    };

	struct PlayerData {
		//TEMP for test mock death
		int			temp_count;
        int         playerId;
        int         playerEntityId;
        std::string username;
        int         deaths;
		int			death_posX;
		int			death_posY;
        bool        alive;
        bool        atACheckpoint;
		int			death_cooldowns;
		int			invulnerability_cooldowns;

        PlayerUpgrades  upgrades;
        PlayerCooldowns cooldowns;
    };

	int temp_count;

	void		sendPlayerStateUpdate( const PlayerData& playerData );
	void 		addPlayerData( int playerId, int playerEntityId, const std::string& username );
	PlayerData*	getPlayerData( int playerId );
	void		disconnectPlayerData( int playerId );
	json		getAllPlayerDataAsJson( void );

private:

	static bool		_invalid_entity( const json& in );

	void	_loop_processInputs( void );
	void	_loop_tickEntities( void );

	void	_input_ping( const json& in );
	void	_input_sync( const json& in );
	void	_input_join( const json& in );
	void	_input_leave( const json& in );
	void	_input_move( const json& in );
	void	_input_action( const json& in );

	bool					_running;
	unsigned int			_nextEntityId, _tick, _scale;
	int						_spawnX, _spawnY;
	entityList_t			_entities;
	playerIds_t				_playerIds;
	playerInput_t			_playerInputs;
	std::vector<PlayerData> _playerData;
	const std::string		_roomId;
};

extern int			g_uspt;
extern GameEngine*	g_game;

#endif
