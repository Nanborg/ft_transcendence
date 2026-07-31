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
		case InputTypes::PING:
			_input_ping(in);
			break;

		case InputTypes::SYNC:
			_input_sync(in);
			break;

		case InputTypes::JOIN:
			_input_join(in);
			break;

		case InputTypes::LEAVE:
			_input_leave(in);
			break;

		case InputTypes::MOVE:
			_input_move(in);
			break;

		case InputTypes::ACTION:
			_input_action(in);
			break;

		default:
			break;
	}
}

void GameEngine::pushInput( const json& in ) {
	_playerInputs.push(in);
}

void	GameEngine::sendEntityUpdate( const AbstractEntity* entity ) {
	json out;

	out["type"] = "entityUpdate";
	out["tick"] = _tick;
	out["roomId"] = _roomId;
	out["entity"] = entity->toJson();
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

bool			GameEngine::isRunning( void ) const { return _running; }

unsigned int	GameEngine::getScale( void ) const { return _scale; }

bool	GameEngine::_invalid_entity( const json& in ) {
	if (!in["typeId"].is_number_integer())
		return true;
	if (!in["posX"].is_number_integer())
		return true;
	if (!in["posY"].is_number_integer())
		return true;
	if (!in["velX"].is_number_integer())
		return true;
	if (!in["velY"].is_number_integer())
		return true;
	return false;
}

void	GameEngine::init( const json& in ) {
	if (!in["scale"].is_number_integer())
		return;
	if (!in["entities"].is_array())
		return;

	_scale = in["scale"];
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

	case EntityTypes::WALKINGGOOB:
		entity = new WalkingGoobEntity(posX, posY);
		break;

	case EntityTypes::SHOOTINGGOOB:
		entity = new ShootingGoobEntity(posX, posY);
		break;

	case EntityTypes::TANKGOOB:
		entity = new TankGoobEntity(posX, posY);
		break;

	case EntityTypes::LORDGOOB:
		entity = new LordGoobEntity(posX, posY);
		break;

	case EntityTypes::LASERSLASH:
		return NULL;

	case EntityTypes::LASERPROJECTILE:
		return NULL;

	case EntityTypes::LASERSHIELD:
		return NULL;

	case EntityTypes::BOSSPROJECTILE:
		return NULL;

	case EntityTypes::CHECKPOINT:
		entity = new CheckpointEntity(posX, posY);
		break;

	case EntityTypes::SPAWNPOINT:
		entity = new SpawnPointEntity(posX, posY);
		break;

	default:
		return NULL;
	}
	_entities.push_front(entityPtr_t(entity));
	sendEntityUpdate(entity);
	return entity;
}

AbstractEntity*						GameEngine::getNearestEntityOfType( int typeId, int posX, int posY ) {
	entityList_t::iterator	min = _entities.end();
	unsigned int			dist, distmin = 0xFFFFFFFF;
	for (entityList_t::iterator it; it != _entities.end(); it++) {
		if (it->get()->getType() == typeId)
			continue;
		dist = it->get()->distance(posX, posY);
		if (dist < distmin) {
			min = it;
			distmin = dist;
		}
	}
	return min->get();
}

GameEngine::entityList_t::iterator	GameEngine::getEntityIterator(int entityId)
{
	return std::find_if(_entities.begin(), _entities.end(), [entityId](const auto &e){return e->getId() == entityId;});
}

void	GameEngine::deleteEntity( entityList_t::iterator it ) {
	if (it == _entities.end())
		return;
	sendEntityDelete(it->get());
	_entities.erase(it);
}
