#include <GameEngine.hpp>

void	GameEngine::_input_ping( const json& in ) {
	json out;
	out["type"] = "ping";
	out["uspt"] = g_uspt;
	out["tick"] = _tick;
	out["roomId"] = _roomId;
	out["nextEntityId"] = _nextEntityId;
	out["entities"] = _entities.size();
	g_io->sendMsg(out.dump());
}

void	GameEngine::_input_sync( const json& in ) {
	json out;

	out["type"] = "sync";
	out["roomId"] = _roomId;
	out["tick"] = _tick;
	out["end"] = false;
	out["entities"] = json::array();
	for (entityList_t::iterator it = _entities.begin(); it != _entities.end(); it++) {
		out["entities"][std::distance(_entities.begin(), it)] = it->get()->toJson();
	}
	out["playerData"] = getAllPlayerDataAsJson();
	g_io->sendMsg(out.dump());
}

void	GameEngine::_input_join( const json& in ) {
	// TODO(neon-05): Align player_join payload with the backend player mapping
	// and the final enginePlayerId contract.
	if (!in["playerId"].is_number())
		return;

	if (_playerIds.count(in["playerId"]) == 0) {
		PlayerEntity *player = new PlayerEntity(in["playerId"], _spawnX, _spawnY, 0, 0);
		_playerIds[in["playerId"]] = player->getId();
		_entities.push_front(entityPtr_t(player));
		std::string username = "Player";
        if (in.count("username") > 0 && in["username"].is_string()) {
            username = in["username"];
        }
        addPlayerData(in["playerId"], player->getId(), username);
	}
}

void	GameEngine::_input_leave( const json& in ) {
	// TODO(neon-05): Keep leave/disconnect behavior aligned with backend
	// in-game disconnect handling.
	if (!in["playerId"].is_number())
		return;

	if (_playerIds.count(in["playerId"]) > 0) {
		deleteEntity(getEntityIterator(_playerIds[in["playerId"]]));
		_playerIds.erase(in["playerId"]);
		disconnectPlayerData(in["playerId"]);
	}
}

void	GameEngine::_input_move( const json& in ) {
	// TODO(neon-05): Map this MOVE input to the final player_input contract
	// and keep movement deterministic for the engine tick.
	if (!in["playerId"].is_number())
		return;
	if (!in["velX"].is_number())
		return;
	if (!in["velY"].is_number())
		return;

	if (_playerIds.count(in["playerId"]) > 0) {
		int entityId = _playerIds[in["playerId"]];
		entityList_t::iterator it = getEntityIterator(entityId);
		if (it != _entities.end())
		{
			AbstractEntity *e = it->get();
			((PlayerEntity *) e)->movementInput(in["velX"], in["velY"]);
		}
	}
}

void	GameEngine::_input_action( const json& in ) {
	if (!in["playerId"].is_number_integer())
		return;
	PlayerData *player_data = getPlayerData(in["playerId"]);
	if (player_data && in.count("upgrade") > 0 && in["upgrade"].is_object()) {
        if (in["upgrade"].count("melee") > 0 && in["upgrade"]["melee"] == true)
            player_data->upgrades.melee++;
        else if (in["upgrade"].count("ranged") > 0 && in["upgrade"]["ranged"] == true)
            player_data->upgrades.ranged++;
        else if (in["upgrade"].count("shield") > 0 && in["upgrade"]["shield"] == true)
            player_data->upgrades.shield++;
    }
	if (!in["action"].is_number_integer())
		return;
	if (_playerIds.count(in["playerId"]) == 0)
		return;
	entityList_t::iterator it = getEntityIterator(_playerIds[in["playerId"]]);
	if (it == _entities.end())
		return;
	PlayerEntity *player = (PlayerEntity *) it->get();
	player->playerAction(in);
}
