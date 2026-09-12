#ifndef CONTROLLERIO_HPP
#define CONTROLLERIO_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <poll.h>
#include <unistd.h>
#include <exception>
#include <json.hpp>

using namespace nlohmann;

class ControllerIO
{
public:
	ControllerIO( int port );
	~ControllerIO( void );

	int pollApi( void );
	json getMsg( void );
	void sendMsg( std::string object );

private:
	int				_sockfd;
	struct pollfd	_pollFd;
	sockaddr_in		_apiAddr, _servAddr;
	socklen_t		_apiSize;
};

extern ControllerIO*	g_io;

#endif
