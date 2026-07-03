#ifndef CONTROLLERIO_HPP
#define CONTROLLERIO_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <poll.h>
#include <exception>

class ControllerIO
{
public:
	ControllerIO( int port );
	~ControllerIO( void );

	int pollApi( void );
	int getMsg( char buffer[16] );
	int sendMsg( char *buffer, int len );

private:
	void		_setApiAddr( sockaddr& );

	int				_sockfd;
	struct pollfd	_pollFd;
	sockaddr_in		_apiAddr, _servAddr;
	socklen_t		_apiSize;
};

#endif
