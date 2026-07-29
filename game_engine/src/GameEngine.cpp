#include "GameEngine.hpp"

GameEngine::GameEngine( const std::string& roomId ):
	_roomId(roomId),
	_running(false),
	_tick(0),
	_nextEntityId(0) {}
GameEngine::~GameEngine( void ) {}

void	GameEngine::manageInput( const json& in ) {
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

void GameEngine::pushInput( const json& in ) {
	_playerInputs.push(in);
}

void	GameEngine::sendEntityUpdate( const AbstractEntity* entity ) {
	json entityJson, out;

	entityJson["entityId"] = entity->getId();
	entityJson["entityTypeId"] = entity->getType();
	entityJson["posX"] = entity->getPosX();
	entityJson["posY"] = entity->getPosY();
	entityJson["velX"] = entity->getVelX();
	entityJson["velY"] = entity->getVelY();

	out["type"] = "entityUpdate";
	out["tick"] = _tick;
	out["roomId"] = _roomId;
	out["entity"] = entityJson;
	g_io->sendMsg(out.dump());
}

void	GameEngine::sendEntityDelete( const AbstractEntity* entity ) {
	json out;

	out["type"] = "entityDelete";
	out["tick"] = _tick;
	out["roomId"] = _roomId;
	out["entity"]["entityId"] = entity->getId();
	g_io->sendMsg(out.dump());
}

int		GameEngine::newId( void ) { return _nextEntityId++; }

bool	GameEngine::isRunning( void ) const { return _running; }

bool	GameEngine::_invalid_entity( const json& in ) {
	if (!in["typeId"].is_number_integer())
		return true;
	if (!in["posX"].is_number_integer())
		return true;
	if (!in["posY"].is_number_integer())
		return true;
	if (!in["posX"].is_number_integer())
		return true;
	if (!in["posY"].is_number_integer())
		return true;
	return false;
}

void	GameEngine::init( const json& in ) {
	// _scale = in["scale"];
	json entities = in["entities"];
	for (size_t i = 0; i < entities.size(); i++) {
		if (_invalid_entity(entities[i]))
			continue;
		std::cout << entities[i].dump() << std::endl;
		spawnNewEntity(entities[i]["typeId"], entities[i]["posX"], entities[i]["posY"], entities[i]["velX"], entities[i]["velY"]);
	}
}

void	GameEngine::stop( void ) { std::cout << "\nstop" << std::endl; _running = false; }
void	GameEngine::start( void ) { std::cout << "\nstart" << std::endl; _running = true; }

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

typename GameEngine::entityList_t::iterator	GameEngine::getEntityIterator( int entityId ) {
	return std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
}

void	GameEngine::deleteEntity( entityList_t::iterator it ) {
	if (it == _entities.end())
		return;
	sendEntityDelete(it->get());
	_entities.erase(it);
}
