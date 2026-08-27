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
		GameEngine::PlayerData* pd = getPlayerData(in["playerId"]);
		if (pd)
			player->setGold(pd->gold);
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

const int MAX_UPGRADE_LEVEL = 3;
const int UPGRADE_COST_MELEE = 100;
const int UPGRADE_COST_RANGED = 100;
const int UPGRADE_COST_SHIELD = 100;
const int UPGRADE_COST_HEALTH = 10;
const int UPGRADE_HEALTH_BONUS = 10;

void	GameEngine::_input_action( const json& in ) {
	if (!in["playerId"].is_number_integer())
		return;
	PlayerData *player_data = getPlayerData(in["playerId"]);
	if (player_data && in.count("upgrade") > 0 && in["upgrade"].is_object()) {
		if (player_data->alive == false || player_data->atACheckpoint == false || player_data->playerEntityId == -1)
			return;
		entityList_t::iterator entIt = getEntityIterator(player_data->playerEntityId);
		if (entIt == _entities.end())
			return;
		int cost_m = (UPGRADE_COST_MELEE + player_data->upgrades.melee * 150); // upgrade lvl2 will be 250 as in the doc
		int cost_r = (UPGRADE_COST_RANGED + player_data->upgrades.ranged * 150);
		int cost_s = (UPGRADE_COST_SHIELD + player_data->upgrades.shield * 150);
		int cost_h = UPGRADE_COST_HEALTH;

		if (in["upgrade"].count("melee") > 0 && in["upgrade"]["melee"] == true && player_data->upgrades.melee < MAX_UPGRADE_LEVEL && player_data->gold >= cost_m)
		{
			player_data->gold -= cost_m;
			player_data->upgrades.melee++;
			entIt->get()->setGold(player_data->gold);
			sendEntityUpdate(entIt->get());
			sendPlayerStateUpdate(*player_data);
		}
		else if (in["upgrade"].count("ranged") > 0 && in["upgrade"]["ranged"] == true && player_data->upgrades.ranged < MAX_UPGRADE_LEVEL && player_data->gold >= cost_r)
		{
			player_data->gold -= cost_r;
			player_data->upgrades.ranged++;
			entIt->get()->setGold(player_data->gold);
			sendEntityUpdate(entIt->get());
			sendPlayerStateUpdate(*player_data);
		}
		else if (in["upgrade"].count("shield") > 0 && in["upgrade"]["shield"] == true && player_data->upgrades.shield < MAX_UPGRADE_LEVEL && player_data->gold >= cost_s)
		{
			player_data->gold -= cost_s;
			player_data->upgrades.shield++;
			entIt->get()->setGold(player_data->gold);
			sendEntityUpdate(entIt->get());
			sendPlayerStateUpdate(*player_data);
		}
		else if (in["upgrade"].count("health") > 0 && in["upgrade"]["health"] == true && player_data->gold >= cost_h)
		{
			player_data->gold -= cost_h;
			entIt->get()->setGold(player_data->gold);
			entIt->get()->setHealth(entIt->get()->getHealth() + UPGRADE_HEALTH_BONUS);
			sendEntityUpdate(entIt->get());
			sendPlayerStateUpdate(*player_data);
		}
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
