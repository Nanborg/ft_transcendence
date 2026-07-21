#include "GameEngine.hpp"

void	GameEngine::_input_ping( const json& in ) {
	json out;
	out["type"] = "ping";
	out["uspt"] = g_uspt;
	out["entities"] = _entities.size();
	_io.sendMsg(out.dump());
}

void	GameEngine::_input_join( const json& in ) {
	// TODO(neon-05): Align player_join payload with the backend player mapping
	// and the final enginePlayerId contract.
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) == 0) {
		PlayerEntity *player = new PlayerEntity(in["playerId"], 0, 0, 0, 0);
		_playerIds[in["playerId"]] = player->getId();
		_entities.push_front(entityPtr_t(player));
	}
}

void	GameEngine::_input_leave( const json& in ) {
	// TODO(neon-05): Keep leave/disconnect behavior aligned with backend
	// in-game disconnect handling.
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		deleteEntity(_playerIds[in["playerId"]]);
		_playerIds.erase(in["playerId"]);
	}
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
