#include "GameEngine.hpp"
#include "PlayerEntity.hpp"
#include <algorithm>
#include <cstddef>

void	GameEngine::_input_ping( const json& in ) {
	json out;
	(void)in;
	std::size_t totalEntities = 0;
	for (
		gameSessions_t::const_iterator gameIt = _games.begin();
		gameIt != _games.end();
		++gameIt
	) {
		totalEntities += gameIt->second.entities.size();
	}
	out["type"] = "ping";
	out["uspt"] = _uspt;
	out["entities"] = totalEntities;
	out["games"] = _games.size();
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
		sendEntityDelete(gameId, it->get());
		game->entities.erase(it);
	}
	game->playerIds.erase(playerId);
	if (game->playerIds.empty())
		_games.erase(gameId);
}

void	GameEngine::_input_move(const json& in) {
	std::string	gameId;
	int			playerId;

	if (!_getGameId(in, gameId))
		return;
	if (
		!in.contains("playerId")
		|| !in["playerId"].is_number()
		|| !in.contains("X")
		|| !in["X"].is_number()
		|| !in.contains("Y")
		|| !in["Y"].is_number()
	)
		return;
	playerId = in["playerId"];
	GameSession* game = _getGameSession(gameId);
	if (game == nullptr)
		return;
	PlayerEntity* player = _findPlayer(*game, playerId);
	if (player == nullptr)
		return;
	player->movementInput(
		in["X"],
		in["Y"]
	);
}

void	GameEngine::_input_build(const json& in) {
	std::string	gameId;
	int			playerId;

	if (!_getGameId(in, gameId))
		return;

	if (
		!in.contains("playerId")
		|| !in["playerId"].is_number()
		|| !in.contains("typeId")
		|| !in["typeId"].is_number()
		|| !in.contains("X")
		|| !in["X"].is_number()
		|| !in.contains("Y")
		|| !in["Y"].is_number()
	)
		return;

	playerId = in["playerId"];

	GameSession* game = _getGameSession(gameId);

	if (game == nullptr)
		return;

	PlayerEntity* player = _findPlayer(*game, playerId);

	if (player == nullptr)
		return;

	spawnNewEntity(gameId, *game, in["typeId"],
		in["X"],
		in["Y"],
		0,
		0
	);
}

void	GameEngine::_input_delete(const json& in) {
	std::string	gameId;
	int			playerId;

	if (!_getGameId(in, gameId))
		return;
	if (!in.contains("playerId") || !in["playerId"].is_number() || !in.contains("entityId")
		|| !in["entityId"].is_number()
	)
		return;
	playerId = in["playerId"];
	GameSession* game = _getGameSession(gameId);
	if (game == nullptr)
		return;
	PlayerEntity* player = _findPlayer(*game, playerId);
	if (player == nullptr)
		return;
	deleteEntity(gameId, *game, in["entityId"]);
}
