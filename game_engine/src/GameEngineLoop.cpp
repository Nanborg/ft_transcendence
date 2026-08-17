#include <GameEngine.hpp>

void	GameEngine::tick( void ) {
	g_game = this;
	_loop_processInputs();
	_loop_tickEntities();
	_tick++;
	suffer_damage();
	for(int i = 0; i < _playerData.size(); i++)
	{
		PlayerData &cur_player = _playerData[i];
		if (cur_player.alive == false)
		{
			cur_player.death_cooldowns--;
			sendPlayerStateUpdate(cur_player);
			if (cur_player.death_cooldowns == 0)
			{
				cur_player.alive = true;
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
	// TEMP: Simulating a boss defeat after 15 seconds.
	if (_tick >= 150 && _running) {
		stop("boss_defeated");
	}
	g_game = NULL;
}

void GameEngine::_loop_processInputs(void)
{
	while (!_playerInputs.empty()) {
		manageInput(_playerInputs.front());
		_playerInputs.pop();
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
			sendEntityDelete(it->get());
			it = _entities.erase(it);
		} else {
			++it;
		}
	}
}
