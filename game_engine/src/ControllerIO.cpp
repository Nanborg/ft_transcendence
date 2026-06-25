#include "ControllerIO.hpp"
#include <iostream>

ControllerIO::ControllerIO( int port ) {
	if ((_sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0)
		throw std::exception();
	_pollFd.fd = _sockfd;
	_pollFd.events = POLLIN;
	_servAddr.sin_family = AF_INET;
	_servAddr.sin_port = htons(port);
	_servAddr.sin_addr.s_addr = INADDR_ANY;
	_apiAddr.sin_addr.s_addr = 0;
	_apiSize = sizeof(_apiAddr);
	if (bind(_sockfd, (struct sockaddr*) &_servAddr, sizeof(_servAddr)))
		throw std::exception();
}

ControllerIO::~ControllerIO( void ) {}

int ControllerIO::pollApi() {
	int k = poll(&_pollFd, 1, 0);
	if (k > 0)
		std::cout << "found\n";
	return k;
}

int ControllerIO::getMsg( uint8_t buffer[16] ) {
	sockaddr_in sender;
	int bytes = recvfrom(_sockfd, buffer, 16, 0, (struct sockaddr*) &sender, &_apiSize);
	if (_apiAddr.sin_addr.s_addr == 0)
		_apiAddr = sender;
	return bytes;
}

int ControllerIO::sendMsg( uint8_t buffer[32] ) {
	return sendto(_sockfd, buffer, 32, 0, (struct sockaddr*) &_apiAddr, _apiSize);
}
