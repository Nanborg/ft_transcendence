#include "GameEngine.hpp"

GameEngine::GameEngine( int port ):
	_io(port),
	_running(false),
	_nextEntityId(0) {}

GameEngine::~GameEngine( void ) {}

void GameEngine::stop( void ) { _running = false; }
void GameEngine::init( void ) { std::cout << "init" << std::endl; }
void GameEngine::start( void ) {
	char buffer[17] = {0}; // extra byte at the end to make this a valid c str TODO: remove before submitting
	_running = true;
	while (_running)
	{
		while (_io.pollApi() > 0 && _io.getMsg(buffer) > 0)
		{
			write(1, buffer, 16);
			write(1, "\n", 1);
			if (buffer[0] == '~')
				stop();
		}

		for (entityList::iterator it = _entities.begin(); it != _entities.end(); it++)
		{
			if (it->doTick())
				std::cout << "entity " << it->getId() << " updated\n";
		}
		std::cout << "ticked " << std::distance(_entities.begin(), _entities.end()) << " entities" << std::endl;

		std::cout << "sleep" << std::endl;
		sleep(1);
	}
}
