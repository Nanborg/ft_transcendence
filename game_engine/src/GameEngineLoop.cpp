#include <GameEngine.hpp>

void	GameEngine::tick( void ) {
	g_game = this;
	_loop_processInputs();
	_loop_tickEntities();
	_tick++;
	g_game = NULL;
	// TEMP: Simulating a boss defeat after 15 seconds.
	if (_tick >= 150 && _running) {
		stop("game_defeat_boss_mock");
	}
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
