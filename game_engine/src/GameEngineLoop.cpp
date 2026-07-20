#include "GameEngine.hpp"

void	GameEngine::_loop_receiveMessages( void ) {
	while (_io.pollApi() > 0)
		_playerInputs.push(_io.getMsg());
}

void	GameEngine::_loop_processInputs( void ) {
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
	for (
		gameSessions_t::iterator gameIt = _games.begin();
		gameIt != _games.end();
		++gameIt
	) {
		GameSession& game = gameIt->second;
		for (entityList_t::iterator entityIt = game.entities.begin(); entityIt != game.entities.end();)
		{
			if (entityIt->get()->doTick()) {
				std::cout << "entity " << entityIt->get()->getId() << " updated\n";
				sendEntityUpdate(gameIt->first, entityIt->get());
			}
			if (entityIt->get()->getHealth() <= 0) {
				sendEntityDelete(gameIt->first, entityIt->get());
				entityIt = game.entities.erase(entityIt);
			}
			else {
				++entityIt;
			}
		}
	}
}
