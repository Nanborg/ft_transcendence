#include "GameEngine.hpp"

const unsigned int GameEngine::_target_uspt = 100000;

GameEngine::GameEngine( int port ):
	_io(port),
	_running(false),
	_nextEntityId(0) {}
GameEngine::~GameEngine( void ) {}

void	GameEngine::manageInput( const json& in ) {
	// TODO(neon-05): Strictly validate all incoming commands
	// (player_input, player_join, player_leave/build/delete) and ignore
	// invalid payloads without crashing the engine.
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

		case inputTypes_e::BUILD:
			_input_build(in);
			break;

		case inputTypes_e::DELETE:
			_input_delete(in);
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

	out["type"] = "entityUpdate";
	out["entity"] = entityJ;
	_io.sendMsg(out.dump());
}

void	GameEngine::sendEntityDelete( const AbstractEntity* entity ) {
	json out;
	// TODO(neon-05): Keep entityDelete compatible with the backend state mapper
	// until the engine emits full game_state snapshots directly.

	out["type"] = "entityDelete";
	out["entity"]["entityId"] = entity->getId();
	_io.sendMsg(out.dump());
}

int		GameEngine::newId( void ) { return _nextEntityId++; }

void	GameEngine::stop( void ) { std::cout << "\nstop" << std::endl; _running = false; }
void	GameEngine::init( void ) { std::cout << "init" << std::endl; }
void	GameEngine::start( void ) {
	_running = true;
	while (_running) {
		// TODO(neon-05): Add a stable engine tick counter and include it in
		// game_state/game_end messages.
		auto begin = std::chrono::steady_clock::now();
		_loop_receiveMessages();
		_loop_processInputs();
		_loop_tickEntities();
		auto end = std::chrono::steady_clock::now();

		_uspt = std::chrono::duration_cast<std::chrono::microseconds>(end-begin).count();
		int sleep_time = _target_uspt - _uspt;
		if (sleep_time > 0)
			usleep(sleep_time);
	}
}

bool	GameEngine::checkCollision( AbstractEntity* entity ) const {
	// TODO(neon-05): Implement collision checks for solid entities and damage
	// interactions before enabling Enemy/Projectile gameplay.
	return false;
}

AbstractEntity*	GameEngine::spawnNewEntity( int typeId, int posX, int posY, int velX, int velY ) {
	AbstractEntity* entity;
	// TODO(neon-05): Support spawning the minimum coop 2D entities:
	// Enemy, Projectile, and Resource.
	switch (typeId) {
	case EntityTypes::PLAYERENTITY:
		return NULL; // PlayerEntity not spawnable in this context

	case EntityTypes::WALLENTITY:
		entity = new WallEntity(posX, posY);
		break;

	default:
		return NULL;
	}
	_entities.push_front(entityPtr_t(entity));
	sendEntityUpdate(entity);
	return entity;
}

void	GameEngine::deleteEntity( int entityId ) {
	entityList_t::iterator it = std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
	if (it == _entities.end())
		return;
	sendEntityDelete(it->get());
	_entities.erase(it);
}
