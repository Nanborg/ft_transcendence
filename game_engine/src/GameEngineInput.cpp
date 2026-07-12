#include "GameEngine.hpp"

void	GameEngine::_input_ping( const json& in ) {
	json out;
	out["type"] = "ping";
	out["uspt"] = _uspt;
	out["entities"] = _entities.size();
	_io.sendMsg(out.dump());
}

void	GameEngine::_input_join( const json& in ) {
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) == 0) {
		PlayerEntity *player = new PlayerEntity(in["playerId"], 0, 0, 0, 0);
		_playerIds[in["playerId"]] = player->getId();
		_entities.push_front(entityPtr_t(player));
	}
}

void	GameEngine::_input_leave( const json& in ) {
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		deleteEntity(_playerIds[in["playerId"]]);
		_playerIds.erase(in["playerId"]);
	}
}

void	GameEngine::_input_move( const json& in ) {
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
