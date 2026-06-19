#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <forward_list>
#include <iostream>
#include "ControllerIO.hpp"
#include "AbstractEntity.hpp"

class GameEngine
{
public:
	GameEngine( int port );
	~GameEngine( void );

	void init( void );
	void start( void );
	void stop( void );

private:
	typedef std::forward_list<AbstractEntity> entityList;
	ControllerIO	_io;
	bool			_running;
	int				_nextEntityId;
	entityList		_entities;
};

extern GameEngine *g_game;

#endif
