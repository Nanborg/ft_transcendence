#ifndef CONTROLLERIO_HPP
#define CONTROLLERIO_HPP

#include <sys/socket.h>
#include <netinet/in.h>
#include <poll.h>
#include <unistd.h>
#include <exception>

class ControllerIO
{
public:
	ControllerIO( int port );
	~ControllerIO( void );

	int pollApi( void );
	int getMsg( uint8_t buffer[16] );
	int sendMsg( uint8_t buffer[32] );

private:
	void		_setApiAddr( sockaddr& );

	int				_sockfd;
	struct pollfd	_pollFd;
	sockaddr_in		_apiAddr, _servAddr;
	socklen_t		_apiSize;
};

#endif
