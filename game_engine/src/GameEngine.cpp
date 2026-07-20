#include "GameEngine.hpp"
#include "AbstractEntity.hpp"
#include "PlayerEntity.hpp"
#include <algorithm>

const unsigned int GameEngine::_target_uspt = 100000;

GameEngine::GameEngine( int port ):
	_io(port),
	_running(false),
	_nextEntityId(0) {}
GameEngine::~GameEngine( void ) {}

GameEngine::GameSession*	GameEngine::_getGameSession(const std::string& gameId) {
	gameSessions_t::iterator it = _games.find(gameId);
	if (it == _games.end())
		return NULL;
	return &it->second;
}

GameEngine::GameSession&	GameEngine::_getOrCreateGameSession( const std::string& gameId ) {
	return _games[gameId];
}

bool	GameEngine::_getGameId(const json& in, std::string& gameId ) const
{
	if (!in.contains("gameId"))
		return false;
	if (!in["gameId"].is_string())
		return false;
	gameId = in["gameId"].get<std::string>();
	if (gameId.empty())
		return false;
	return true;
}

AbstractEntity *GameEngine::_findEntity(GameSession& game, int entityId)
{
	entityList_t::iterator it = std::find_if(
		game.entities.begin(),
		game.entities.end(),
		[entityId](const auto& entity) {
			return entity->getId() == entityId;
		}
	);
	if (it == game.entities.end())
		return nullptr;
	return it->get();
}

PlayerEntity* GameEngine::_findPlayer (GameSession& game, int playerId)
{
	playerIds_t::iterator playerIt = game.playerIds.find(playerId);
	if (playerIt == game.playerIds.end())
		return nullptr;
	AbstractEntity* entity = _findEntity(game, playerIt->second);
	if (entity == nullptr)
		return nullptr;
	return static_cast<PlayerEntity*>(entity);
}

void	GameEngine::manageInput( const json& in ) {
	// TODO(neon-05): Strictly validate all incoming commands
	// (player_input, player_join, player_leave/build/delete) and ignore
	// invalid payloads without crashing the engine.
	if (!in["type"].is_number())
		return;
	int type = in["type"];
	switch (type) {
		case inputTypes_e::PING:
			_input_ping(in);
			break;

		case inputTypes_e::JOIN:
			_input_join(in);
			break;

		case inputTypes_e::LEAVE:
			_input_leave(in);
			break;

		case inputTypes_e::MOVE:
			_input_move(in);
			break;

		case inputTypes_e::BUILD:
			_input_build(in);
			break;

		case inputTypes_e::DELETE:
			_input_delete(in);
			break;

		default:
			break;
	}
}

void	GameEngine::sendEntityUpdate( const std::string& gameId, const AbstractEntity* entity ) {
	json entityJ, out;
	// TODO(neon-05): Replace or complement entityUpdate/entityDelete with a
	// full game_state payload compatible with docs/formats_communication_reference.md.
	// Include players, enemies, projectiles, resources, objective, score, and tick.

	entityJ["entityId"] = entity->getId();
	entityJ["entityTypeId"] = entity->getType();
	entityJ["posX"] = entity->getPosX();
	entityJ["posY"] = entity->getPosY();
	entityJ["velX"] = entity->getVelX();
	entityJ["velY"] = entity->getVelY();

	out["type"] = "entityUpdate";
	out["gameId"] = gameId;
	out["entity"] = entityJ;
	_io.sendMsg(out.dump());
}

void	GameEngine::sendEntityDelete( const std::string& gameId, const AbstractEntity* entity ) {
	json out;
	// TODO(neon-05): Keep entityDelete compatible with the backend state mapper
	// until the engine emits full game_state snapshots directly.

	out["type"] = "entityDelete";
	out["gameId"] = gameId;
	out["entity"]["entityId"] = entity->getId();
	_io.sendMsg(out.dump());
}

int		GameEngine::newId( void ) { return _nextEntityId++; }

void	GameEngine::stop( void ) { std::cout << "\nstop" << std::endl; _running = false; }
void	GameEngine::init( void ) { std::cout << "init" << std::endl; }
void	GameEngine::start( void ) {
	_running = true;
	while (_running) {
		// TODO(neon-05): Add a stable engine tick counter and include it in
		// game_state/game_end messages.
		auto begin = std::chrono::steady_clock::now();
		_loop_receiveMessages();
		_loop_processInputs();
		_loop_tickEntities();
		auto end = std::chrono::steady_clock::now();

		_uspt = std::chrono::duration_cast<std::chrono::microseconds>(end-begin).count();
		int sleep_time = _target_uspt - _uspt;
		if (sleep_time > 0)
			usleep(sleep_time);
	}
}

bool	GameEngine::checkCollision( AbstractEntity* entity ) const {
	// TODO(neon-05): Implement collision checks for solid entities and damage
	// interactions before enabling Enemy/Projectile gameplay.
	return false;
}

void	GameEngine::spawnNewEntity( const std::string& gameId, GameEngine::GameSession& game, int typeId, float posX, float posY, float velX, float velY ) {
	AbstractEntity* entity;
	// TODO(neon-05): Support spawning the minimum coop 2D entities:
	// Enemy, Projectile, and Resource.
	switch (typeId) {
		case EntityTypes::PLAYERENTITY:
			return; // PlayerEntity not spawnable in this context

		case EntityTypes::WALLENTITY:
			entity = new WallEntity(posX, posY);
			break;

		default:
			return;
	}
	sendEntityUpdate(gameId, entity);
	game.entities.push_front(entityPtr_t(entity));
}

void	GameEngine::deleteEntity(const std::string& gameId, GameEngine::GameSession& game, int entityId ) {
	AbstractEntity* entity = _findEntity(game, entityId);
	if (entity == nullptr)
		return;
	sendEntityDelete(gameId, entity);
	entityList_t::iterator it = std::find_if(game.entities.begin(), game.entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
	if (it != game.entities.end())
		game.entities.erase(it);
}
