#include "GameEngine.hpp"

GameEngine::typeList GameEngine::_knownTypes = GameEngine::typeList();

#define REGISTER_TYPE(T, i) (registerEntityType(typeid(T).hash_code(), i))

GameEngine::GameEngine( int port ):
	_io(port),
	_running(false),
	_nextEntityId(0) {}

GameEngine::~GameEngine( void ) {}

uint8_t GameEngine::registerEntityType( size_t hash_code, int id ) {
	if (id == 0)
		throw (std::runtime_error("Type id 0 forbidden"));
	if (_knownTypes[hash_code] != 0)
		throw (std::runtime_error("Type already registered"));
	_knownTypes[hash_code] = id;
	return id;
}

int		GameEngine::getTypeId( size_t hash_code ) {
	int ret = _knownTypes[hash_code];
	if (ret == 0)
		throw std::runtime_error("Unknown type id");
	return ret;
}

void	GameEngine::registerAllTypes( void ) {
	REGISTER_TYPE(PlayerEntity, 1);
}

void GameEngine::manageInput( uint8_t buffer[16] ) {
	input in;
	in.typeId = *reinterpret_cast<uint8_t*>(&buffer[0]);
	in.playerId = *reinterpret_cast<uint8_t*>(&buffer[1]);
	in.X = *reinterpret_cast<int*>(&buffer[2]);
	in.Y = *reinterpret_cast<int*>(&buffer[6]);
	in.extra = buffer + 10;

	std::cout << "input type " << (int) in.typeId << "\n";
	switch (in.typeId)
	{
	case 0:
		g_game->_input_ping(in);
		break;
	case 1:
		g_game->_input_join(in);
		break;
	case 2:
		g_game->_input_leave(in);
		break;
	case 3:
		g_game->_input_move(in);
		break;
	default:
		break;
	}
}
int		GameEngine::newId( void ) { return _nextEntityId++; }

void	GameEngine::stop( void ) { _running = false; }
void	GameEngine::init( void ) { std::cout << "init" << std::endl; }
void	GameEngine::start( void ) {
	uint8_t buffer[17] = {0}; // extra byte at the end to make this a valid c str TODO: remove before submitting
	_running = true;
	while (_running)
	{
		// TODO: separate this into multiple functions
		while (_io.pollApi() > 0 && _io.getMsg(buffer) > 0)
		{
			write(1, buffer, 16);
			write(1, "\n", 1);
			if (buffer[0] == '~')
				stop();
			else
				manageInput(buffer);
		}

		for (entityList::iterator it = _entities.begin(); it != _entities.end(); it++)
		{
			if ((*it)->doTick())
			{
				std::cout << "entity " << (*it)->getId() << " updated\n";
				
			}
		}
		std::cout << "ticked " << std::distance(_entities.begin(), _entities.end()) << " entities" << std::endl;

		std::cout << "sleep" << std::endl;
		sleep(1);
	}
}

void	GameEngine::_input_ping( input in ) {
	std::cout << "ping\n";
}

void	GameEngine::_input_join( input in ) {
	PlayerEntity *player = new PlayerEntity(in.playerId, 10, in.X, in.Y, 0, 0);
	_playerIds[in.playerId] = player->getId();
	_entities.push_front(entityPtr(player));
}

void	GameEngine::_input_leave( input in ) {
	int entityId = _playerIds[in.playerId];
	entityList::iterator it = _entities.before_begin();
	entityList::iterator it2 = _entities.begin();
	while (it2 != _entities.end() && (*it2)->getId() != entityId) {
		it++;
		it2++;
	}
	_playerIds.erase(in.playerId);
	_entities.erase_after(it);
}

void	GameEngine::_input_move( input in ) {

	int entityId = _playerIds[in.playerId];
	entityList::iterator it = std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
	AbstractEntity *e = &**it;
	((PlayerEntity *) e)->movementInput(in.X, in.Y);
}
