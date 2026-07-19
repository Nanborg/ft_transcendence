#include "GameEngine.hpp"
#include "PlayerEntity.hpp"
#include <algorithm>

void	GameEngine::_input_ping( const json& in ) {
	json out;
	out["type"] = "ping";
	out["uspt"] = _uspt;
	out["entities"] = _entities.size();
	_io.sendMsg(out.dump());
}

void	GameEngine::_input_join( const json& in ) {
	std::string gameId;
	int			playerId;

	if (!_getGameId(in, gameId))
		return;
	if (!in["playerId"].is_number())
		return;
	playerId = in["playerId"];
	GameSession& game = _getOrCreateGameSession(gameId);
	if (game.playerIds.count(playerId) == 0) {
		PlayerEntity *player = new PlayerEntity(playerId, 0, 0, 0, 0);
		game.playerIds[playerId] = player->getId();
		game.entities.push_front(entityPtr_t(player));
	}
}

void	GameEngine::_input_leave( const json& in ) {
	std::string	gameId;
	int			playerId;

	if (!_getGameId(in, gameId))
		return;
	if (!in["playerId"].is_number())
		return;
	playerId = in["playerId"];
	GameSession* game = _getGameSession(gameId);
	if (game == NULL)
		return;
	if (game->playerIds.count(playerId) == 0)
		return;
	int entityId = game->playerIds[playerId];
	entityList_t::iterator it = std::find_if(
		game->entities.begin(),
		game->entities.end(),
		[entityId](const auto& entity) {
			return entity->getId() == entityId;
		}
	);
	if (it != game->entities.end()) {
		sendEntityDelete(it->get());
		game->entities.erase(it);
	}
	game->playerIds.erase(playerId);
	if (game->playerIds.empty())
		_games.erase(gameId);
}

void	GameEngine::_input_move( const json& in ) {
	// TODO(neon-05): Map this MOVE input to the final player_input contract
	// and keep movement deterministic for the engine tick.
	if (!in["playerId"].is_number() || !in["X"].is_number() || !in["Y"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		int entityId = _playerIds[in["playerId"]];
		entityList_t::iterator it = std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
		AbstractEntity *e = it->get();
		((PlayerEntity *) e)->movementInput(in["X"], in["Y"]);
	}
}

void	GameEngine::_input_build( const json& in ) {
	// TODO(neon-05): Decide whether build/delete stay in the minimum playable
	// scope or move to a later gameplay layer.
	if (!in["playerId"].is_number() || !in["typeId"].is_number() || !in["X"].is_number() || !in["Y"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		spawnNewEntity(in["typeId"], in["X"], in["Y"], 0, 0);
	}
}

void	GameEngine::_input_delete( const json& in ) {
	if (!in["playerId"].is_number() || !in["entityId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		deleteEntity(in["entityId"]);
	}
}
