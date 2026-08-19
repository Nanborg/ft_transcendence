#include <GameEngine.hpp>

void	GameEngine::tick( void ) {
	g_game = this;
	_loop_tickPlayerCooldowns();
	_loop_processInputs();
	_loop_tickEntities();
	_updateCheckpointProximity();
	_tick++;
	int deadPlayers = 0;
    for(size_t i = 0; i < _playerData.size(); i++)
	{
        if (_playerData[i].alive == false)
            deadPlayers++;
    }
	if (_playerData.size() > 0 && deadPlayers == _playerData.size()) {
        stop("all_players_dead");
        g_game = NULL;
        return;
    }
	for(int i = 0; i < _playerData.size(); i++)
	{
		PlayerData &cur_player = _playerData[i];
		if (cur_player.alive == false && cur_player.respawnPending == true)
		{
			cur_player.death_cooldowns--;
			sendPlayerStateUpdate(cur_player);
			if (cur_player.death_cooldowns <= 0)
			{
				cur_player.alive = true;
				cur_player.respawnPending = false;
				PlayerEntity *player = new PlayerEntity(cur_player.playerId, cur_player.death_posX, cur_player.death_posY, 0, 0);
				sendEntityUpdate(player);
				_entities.push_front(entityPtr_t(player));
				cur_player.invulnerability_cooldowns = 50;
				cur_player.playerEntityId = player->getId();
				_playerIds[cur_player.playerId] = player->getId();
				sendPlayerStateUpdate(cur_player);
			}
		}
		if (cur_player.alive == true && cur_player.invulnerability_cooldowns > 0)
		{
			cur_player.invulnerability_cooldowns--;
		}
	}
	// Prepare game win condition: stop the game when the boss is defeated
	bool boss_is_alive = false;
    for (auto it = _entities.begin(); it != _entities.end(); ++it) {
        if ((*it)->getType() == EntityTypes::LORDGOOB) {
            boss_is_alive = true;
            break;
        }
    }
    if (_tick > 50 && boss_is_alive == false && _running) {
        stop("boss_defeated");
        g_game = NULL;
        return;
    }
	g_game = NULL;
}

void GameEngine::_loop_tickPlayerCooldowns(void)
{
	for (size_t i = 0; i < _playerData.size(); i++)
	{
		PlayerData& player = _playerData[i];
		if (player.alive == false)
			continue;
		bool changed = false;
		if (player.cooldowns.melee > 0)
		{
			player.cooldowns.melee--;
			changed = true;
		}
		if (player.cooldowns.ranged > 0)
		{
			player.cooldowns.ranged--;
			changed = true;
		}
		if (player.cooldowns.shield > 0)
		{
			player.cooldowns.shield--;
			changed = true;
		}
		if (changed)
			sendPlayerStateUpdate(player);
	}
}

void GameEngine::_loop_processInputs(void)
{
	while (!_playerInputs.empty()) {
		manageInput(_playerInputs.front());
		_playerInputs.pop();
	}
}

void GameEngine::_updateCheckpointProximity(void)
{
	unsigned int checkpointRange = getScale() * CHECKPOINT_RANGE;

	for (size_t i = 0; i < _playerData.size(); i++)
	{
		PlayerData& player = _playerData[i];

		if (!player.alive)
			continue;

		if (_playerIds.count(player.playerId) == 0)
			continue;

		int entityId = _playerIds[player.playerId];
		entityList_t::iterator playerIt = getEntityIterator(entityId);

		if (playerIt == _entities.end())
			continue;

		AbstractEntity* playerEntity = playerIt->get();

		AbstractEntity* nearestCheckpoint = getNearestEntityOfType(
			EntityTypes::CHECKPOINT, playerEntity->getPosX(), playerEntity->getPosY());

		bool wasAtCheckpoint = player.atACheckpoint;
		bool isAtCheckpoint = false;
		if (nearestCheckpoint)
		{
			unsigned int distToCheckpoint = nearestCheckpoint->distance(
				playerEntity->getPosX(), playerEntity->getPosY());

			isAtCheckpoint = (distToCheckpoint < checkpointRange);
			// std::cout << "Is pthe player at a Checkpoint: " << isAtCheckpoint << std::endl;
		}
		player.atACheckpoint = isAtCheckpoint;
		if (player.atACheckpoint != wasAtCheckpoint)
			sendPlayerStateUpdate(player);
	}
}

void	GameEngine::_loop_tickEntities( void ) {
	// TODO(neon-05): Add a collision pass + deferred destruction + cleanup of
	// out-of-play entities per tick.
	// TODO(neon-05): Produce game_end when the basic end condition is reached
	// (objective complete, all players dead, timeout, or score limit).
	for (entityList_t::iterator it = _entities.begin(); it != _entities.end(); )
	{
		if (it->get()->doTick()) {
			std::cout << "entity " << (*it)->getId() << " updated\n";
			sendEntityUpdate(it->get());
		}
		if (it->get()->getHealth() <= 0) {
			markPlayerDead(it->get());
			sendEntityDelete(it->get());
			it = _entities.erase(it);
		} else {
			++it;
		}
	}
}
