#include "GameEngine.hpp"

#define REGISTER_TYPE(T, i) (registerEntityType(typeid(T).hash_code(), i))
GameEngine::typeList_t GameEngine::_knownTypes = GameEngine::typeList_t();

GameEngine::GameEngine( int port ):
	_io(port),
	_running(false),
	_nextEntityId(0) {}
GameEngine::~GameEngine( void ) {}

void	GameEngine::registerAllTypes( void ) {
	// TODO(neon-05): Register minimum coop 2D entity types here:
	// Player, Wall, Enemy, Projectile, and Resource when implemented.
	REGISTER_TYPE(PlayerEntity, 1);
}

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

// TODO(neon-05): Strictly validate all incoming commands
// (player_input, player_join, player_leave) and cleanly ignore invalid payloads.
void GameEngine::manageInput( const json& in ) {
	if (!in["type"].is_number())
		return;
	int type = in["type"];
	switch (type) {
		case inputTypes_e::PING:
			_input_ping(in);
			break;
		case inputTypes_e::JOIN:
			_input_join(in);
			break;
		case inputTypes_e::LEAVE:
			_input_leave(in);
			break;
		case inputTypes_e::MOVE:
			_input_move(in);
			break;
		default:
			break;
	}
}

void	GameEngine::sendEntityUpdate( const AbstractEntity* entity ) {
	json entityJ, out;
	// TODO(neon-05): Replace or complement entityUpdate/entityDelete with a
	// full game_state payload compatible with docs/formats_communication_reference.md.
	// Include players, enemies, projectiles, resources, objective, score, and tick.
	entityJ["entityId"] = entity->getId();
	entityJ["entityTypeId"] = entity->getType();
	entityJ["posX"] = entity->getPosX();
	entityJ["posY"] = entity->getPosY();
	entityJ["velX"] = entity->getVelX();
	entityJ["velY"] = entity->getVelY();

	out["type"] = "entity";
	out["entity"] = entityJ;
	_io.sendMsg(out.dump());
}

int		GameEngine::newId( void ) { return _nextEntityId++; }

void	GameEngine::stop( void ) { std::cout << "\nstop" << std::endl; _running = false; }
void	GameEngine::init( void ) { std::cout << "init" << std::endl; }
void	GameEngine::start( void ) {
	_running = true;
	while (_running)
	{
		// TODO(neon-05): Add a stable engine tick counter and include it in
		// game_state/game_end messages.
		// TODO(neon-05): Stabilize this loop after the GameEngineInput /
		// GameEngineLoop split from PR #110.
		while (_io.pollApi() > 0)
			_playerInputs.push(_io.getMsg());
		while (!_playerInputs.empty()) {
			manageInput(_playerInputs.front());
			_playerInputs.pop();
		}
		// TODO(neon-05): Add a collision pass + deferred destruction + cleanup of
		//out-of-play entities per tick.
		// TODO(neon-05): Produce game_end when the basic end condition is reached
		// (objective complete, all players dead, timeout, or score limit).
		for (entityList_t::iterator it = _entities.begin(); it != _entities.end(); it++)
		{
			if ((*it)->doTick())
			{
				std::cout << "entity " << (*it)->getId() << " updated\n";
				sendEntityUpdate(it->get());
			}
		}
		std::cout << "ticked " << std::distance(_entities.begin(), _entities.end()) << " entities" << std::endl;

		std::cout << "sleep" << std::endl;
		// TODO(neon-05): Replace sleep(1) with the loop timing chosen in PR #110.
		sleep(1);
	}
}

void	GameEngine::_input_ping( const json& in ) {
	std::cout << "ping\n";
	_io.sendMsg(json::parse("{\"type\":\"ping\"}").dump());
}

void	GameEngine::_input_join( const json& in ) {
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) == 0) {
		PlayerEntity *player = new PlayerEntity(in["playerId"], 10, 0, 0, 0, 0);
		_playerIds[in["playerId"]] = player->getId();
		_entities.push_front(entityPtr_t(player));
	}
}

void	GameEngine::_input_leave( const json& in ) {
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		int entityId = _playerIds[in["playerId"]];
		entityList_t::iterator it = _entities.before_begin();
		entityList_t::iterator it2 = _entities.begin();
		while (it2 != _entities.end() && (*it2)->getId() != entityId) {
			it++;
			it2++;
		}
		_playerIds.erase(in["playerId"]);
		_entities.erase_after(it);
	}
}

void	GameEngine::_input_move( const json& in ) {
	if (!in["playerId"].is_number())
		return;
	if (_playerIds.count(in["playerId"]) > 0) {
		int entityId = _playerIds[in["playerId"]];
		entityList_t::iterator it = std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
		AbstractEntity *e = it->get();
		((PlayerEntity *) e)->movementInput(in["X"], in["Y"]);
	}
}
