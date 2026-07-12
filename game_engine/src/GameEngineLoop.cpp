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
	entityList_t::iterator prev;
	for (entityList_t::iterator it = _entities.begin(); it != _entities.end(); it++)
	{
		if (it->get()->doTick()) {
			std::cout << "entity " << (*it)->getId() << " updated\n";
			sendEntityUpdate(it->get());
		}
		if (it->get()->getHealth() <= 0) {
			sendEntityDelete(it->get());
			_entities.erase(it);
			it = prev;
		}
		prev = it;
	}
}
