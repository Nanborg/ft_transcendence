#include "GameEngine.hpp"
#include "AbstractHitboxEntity.hpp"
#include "entities/WalkingGoobEntity.hpp"
#include "enumEntityTypes.h"

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

void GameEngine::sendPlayerStateUpdate( const PlayerData& playerData ) {
	json out;
	out["type"] = "playerUpdate";
	out["roomId"] = _roomId;
	out["tick"] = _tick;
	json pData;
	pData["playerId"] = playerData.playerId;
	pData["playerEntityId"] = playerData.playerEntityId;
	pData["alive"] = playerData.alive;
	pData["death_cooldowns"] = playerData.death_cooldowns;
	pData["deaths"] = playerData.deaths;
	pData["death_posX"] = playerData.death_posX;
	pData["death_posY"] = playerData.death_posY;
	pData["atACheckpoint"] = playerData.atACheckpoint;
	pData["invulnerability_cooldowns"] = playerData.invulnerability_cooldowns;
	pData["upgrades"]["melee"] = playerData.upgrades.melee;
	pData["upgrades"]["ranged"] = playerData.upgrades.ranged;
	pData["upgrades"]["shield"] = playerData.upgrades.shield;
	pData["cooldowns"]["melee"] = playerData.cooldowns.melee;
	pData["cooldowns"]["ranged"] = playerData.cooldowns.ranged;
	pData["cooldowns"]["shield"] = playerData.cooldowns.shield;
	pData["gold"] = playerData.gold;
	pData["damageDealt"] = playerData.damageDealt;
	pData["damageReceived"] = playerData.damageReceived;
	out["playerData"] = pData;
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

void	GameEngine::addPlayerData( int playerId, int playerEntityId, const std::string& username ) {
	PlayerData newPlayer;
	newPlayer.playerEntityId = playerEntityId;
	newPlayer.playerId = playerId;
	newPlayer.username = username;
	newPlayer.deaths = 0;
	newPlayer.alive = true;
	newPlayer.respawnPending = false;
	newPlayer.atACheckpoint = false;
	newPlayer.upgrades.melee = 0;
	newPlayer.upgrades.ranged = 0;
	newPlayer.upgrades.shield = 0;
	newPlayer.cooldowns.melee = 0;
	newPlayer.cooldowns.ranged = 0;
	newPlayer.cooldowns.shield = 0;
	newPlayer.death_cooldowns = 100;
	newPlayer.invulnerability_cooldowns = 0;
	newPlayer.gold = 0;
	newPlayer.damageDealt = 0;
	newPlayer.damageReceived = 0;
	newPlayer.death_posX = 0;
	newPlayer.death_posY = 0;
	_playerData.push_back(newPlayer);
}

GameEngine::PlayerData*	GameEngine::getPlayerData( int playerId ) {
	for(size_t i = 0; i < _playerData.size(); i++) {
		if(_playerData[i].playerId == playerId)
			return (&_playerData[i]);
	}
	return nullptr;
}

GameEngine::PlayerData* GameEngine::getPlayerDataByEntityId(int entityId)
{
	for (size_t i = 0; i < _playerData.size(); i++)
	{
		if (_playerData[i].playerEntityId == entityId)
			return &_playerData[i];
	}
	return nullptr;
}

void GameEngine::markPlayerDead(AbstractEntity* entity)
{
	if (!entity || entity->getType() != EntityTypes::PLAYERENTITY)
		return;
	PlayerData* player = getPlayerDataByEntityId(entity->getId());
	if (!player || player->alive == false)
		return;
	player->alive = false;
	player->respawnPending = true;
	player->deaths++;
	player->death_posX = entity->getPosX();
	player->death_posY = entity->getPosY();
	player->death_cooldowns = 100;
	player->invulnerability_cooldowns = 0;

	_playerIds.erase(player->playerId);
	player->playerEntityId = -1;
	sendPlayerStateUpdate(*player);
}

void	GameEngine::disconnectPlayerData( int playerId ) {
	for (size_t i = 0; i < _playerData.size(); i++) {
		if (_playerData[i].playerId == playerId) {
			_playerData[i].playerEntityId = -1;
			_playerData[i].alive = false;
			_playerData[i].respawnPending = false;
			return;
		}
	}
}

json GameEngine::getAllPlayerDataAsJson( void )
{
	json allPlayers = json::array();
	for (size_t i = 0; i < _playerData.size(); i++)
	{
		json pData;
		pData["playerId"] = _playerData[i].playerId;
		pData["playerEntityId"] = _playerData[i].playerEntityId;
		pData["username"] = _playerData[i].username;
		pData["deaths"] = _playerData[i].deaths;
		pData["alive"] = _playerData[i].alive;
		pData["death_cooldowns"] = _playerData[i].death_cooldowns;
		pData["death_posX"] = _playerData[i].death_posX;
		pData["death_posY"] = _playerData[i].death_posY;
		pData["invulnerability_cooldowns"] = _playerData[i].invulnerability_cooldowns;
		pData["atACheckpoint"] = _playerData[i].atACheckpoint;
		pData["upgrades"]["melee"] = _playerData[i].upgrades.melee;
		pData["upgrades"]["ranged"] = _playerData[i].upgrades.ranged;
		pData["upgrades"]["shield"] = _playerData[i].upgrades.shield;
		pData["cooldowns"]["melee"] = _playerData[i].cooldowns.melee;
		pData["cooldowns"]["ranged"] = _playerData[i].cooldowns.ranged;
		pData["cooldowns"]["shield"] = _playerData[i].cooldowns.shield;
		pData["gold"] = _playerData[i].gold;
		pData["damageReceived"] = _playerData[i].damageReceived;
		pData["damageDealt"] = _playerData[i].damageDealt;
		allPlayers.push_back(pData);
	}
	return allPlayers;
}

int		GameEngine::newId( void ) { return _nextEntityId++; }

bool			GameEngine::isRunning( void ) const { return _running; }

unsigned int	GameEngine::getScale( void ) const { return _scale; }

const GameEngine::entityList_t&	GameEngine::getEntityList(void) const {
	return _entities;
}

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
	json	map;
	try {
		std::cout << (std::string) in["entitiesFile"] << std::endl;
		map = json::parse(std::ifstream((std::string) in["entitiesFile"]));
	} catch(const std::exception&) {
		return;
	}

	if (!map["scale"].is_number_integer())
		return;
	if (!map["spawnX"].is_number_integer())
		return;
	if (!map["spawnY"].is_number_integer())
		return;
	if (!map["entities"].is_array())
		return;

	_scale = map["scale"];
	_spawnX = map["spawnX"];
	_spawnY = map["spawnY"];
	json entities = map["entities"];
	for (size_t i = 0; i < entities.size(); i++) {
		if (_invalid_entity(entities[i]))
			continue;
		std::cout << entities[i].dump() << std::endl;
		buildNewEntity(entities[i]["typeId"], entities[i]["posX"], entities[i]["posY"], entities[i]["velX"], entities[i]["velY"]);
	}
}

void	GameEngine::stop( const std::string &reason ) {
	if (_running == false)
	{
		return;
	}
	std::cout << "\nstop" << std::endl;
	_running = false;
	json out;
	out["type"] = "gameEnd";
	out["roomId"] = _roomId;
	out["tick"] = _tick;
	out["win"] = true;
	out["reason"] = reason;
	out["playerData"] = getAllPlayerDataAsJson();
	if (reason == "engine_error" || reason == "all_players_dead" || reason == "all_players_left") {
		out["win"] = false;
	}
	g_io->sendMsg(out.dump());
}
void	GameEngine::start( void ) { std::cout << "\nstart" << std::endl; _running = true; }

bool GameEngine::canDamage(const AbstractEntity* attacker, const AbstractEntity* target) const
{
	if (!attacker || !target)
		return false;
	const EntityFactions attackerFaction = attacker->getFaction();
	const EntityFactions targetFaction = target->getFaction();
	if (attackerFaction == EntityFactions::NEUTRAL_FACTION || targetFaction == EntityFactions::NEUTRAL_FACTION)
		return false;
	return attackerFaction != targetFaction;
}

void	GameEngine::applyDamage(AbstractEntity* entity, int damage, int attackerId)
{
	if (!entity || damage <= 0)
		return;
	if (entity->getHealth() == INVINCIBLE_HEALTH)
		return;
	if (entity->getType() == EntityTypes::PLAYERENTITY)
	{
		PlayerData* player = getPlayerDataByEntityId(entity->getId());
		if (!player || player->alive == false || player->invulnerability_cooldowns > 0)
			return;
		player->damageReceived += damage;
	}
	if (attackerId != -1)
    {
        PlayerData* attacker = getPlayerDataByEntityId(attackerId);
        if (attacker) {
            attacker->damageDealt += damage;
        }
    }
	int nextHealth = entity->getHealth() - damage;
	if (nextHealth <= 0)
	{
		nextHealth = 0;
		if (entity->getType() != EntityTypes::PLAYERENTITY)
		{
			int reward = entity->getGold();
			if (reward > 0)
			{
				for (size_t i = 0; i < _playerData.size(); i++)
				{
					PlayerData& player = _playerData[i];
					if (player.alive == false)
						continue;
					if (player.playerEntityId != -1)
					{

						auto entIt = getEntityIterator(player.playerEntityId);
						if (entIt != _entities.end()) {
							entIt->get()->setGold(entIt->get()->getGold() + reward);
							sendEntityUpdate(entIt->get());
						}

					}
					player.gold += reward;
					sendPlayerStateUpdate(player); // inform clients of the change
				}
			}
			entity->setGold(0); //dans le doute de la dupli
		}
	}
	entity->setHealth(nextHealth);
	sendEntityUpdate(entity);
}

bool	GameEngine::checkCollision( AbstractEntity* entity ) const {
	// TODO(neon-05): Implement collision checks for solid entities and damage
	// interactions before enabling Enemy/Projectile gameplay.
	for (entityList_t::const_iterator it = _entities.begin(); it != _entities.end(); it++) {
		AbstractEntity* other = it->get();
		if (other->getId() == entity->getId())
			continue;
		if (
			entity->getType() == EntityTypes::WALKINGGOOB &&
			other->getType() == EntityTypes::PLAYERENTITY
		)
		{
			WalkingGoobEntity* walkingGoob =
				static_cast<WalkingGoobEntity*>(entity);
			if (walkingGoob->canPassThroughPlayer())
				continue;
		}
		if (
			entity->getType() == EntityTypes::PLAYERENTITY &&
			other->getType() == EntityTypes::WALKINGGOOB
		)
		{
			WalkingGoobEntity* walkingGoob =
				static_cast<WalkingGoobEntity*>(other);
			if (walkingGoob->canPassThroughPlayer())
				continue;
		}
		if (other->getType() == EntityTypes::LASERSHIELD)
		{
			AbstractHitboxEntity* shield = static_cast<AbstractHitboxEntity*>(other);
			if (shield->getOwnerId() == static_cast<int>(entity->getId()))
				continue;
			AbstractHitboxEntity* movingHitbox = dynamic_cast<AbstractHitboxEntity*>(entity);
			if (movingHitbox && movingHitbox->getOwnerId() == shield->getOwnerId())
				continue;
		}
		if (other->getPassableHitBox())
			continue;
		if (other->checkCollision(*entity))
			return true;
	}

	return false;
}

AbstractEntity*	GameEngine::buildNewEntity( int typeId, int posX, int posY, int velX, int velY ) {
	AbstractEntity* entity;
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

	case EntityTypes::ENEMYPROJECTILE:
		return NULL;

	case EntityTypes::ENEMYMELEE:
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
	spawnEntity(entity);
	return entity;
}

void	GameEngine::spawnEntity( AbstractEntity *entity ) {
	_entities.push_front(entityPtr_t(entity));
	sendEntityUpdate(entity);
}

AbstractEntity*						GameEngine::getNearestEntityOfType( int typeId, int posX, int posY ) {
	AbstractEntity*		min = NULL;
	unsigned int		dist, distmin = 0xFFFFFFFF;
	for (entityList_t::iterator it = _entities.begin(); it != _entities.end(); it++) {
		if (it->get()->getType() != typeId)
			continue;
		dist = it->get()->distance(posX, posY);
		if (dist < distmin) {
			min = it->get();
			distmin = dist;
		}
	}
	return min;
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
