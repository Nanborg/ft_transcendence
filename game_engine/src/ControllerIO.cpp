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

ControllerIO::~ControllerIO( void ) { close(_sockfd); }

int ControllerIO::pollApi() {
	int k = poll(&_pollFd, 1, 0);
	if (k > 0)
		std::cout << "found\n";
	return k;
}

#define BUFFER_SIZE 4096
#define MIN(a,b) (((a) < (b)) ? (a) : (b))

json ControllerIO::getMsg( void ) {
	sockaddr_in sender;
	std::string str;
	char buf[BUFFER_SIZE];
	int bytes = BUFFER_SIZE;
	while (bytes == BUFFER_SIZE) {
		bytes = recvfrom(_sockfd, buf, BUFFER_SIZE, 0, (struct sockaddr*) &sender, &_apiSize);
		// TODO(neon-05): Log errno + socket context for recvfrom/sendto and handle
		//bytes == 0 and bytes < 0 explicitly.
		if (bytes < 0)
			throw std::system_error();
		str.append(buf, bytes);
	}
	if (_apiAddr.sin_addr.s_addr == 0)
		_apiAddr = sender;
	return json::parse(str);
}

void ControllerIO::sendMsg( std::string str ) {
	int bytes = 0;
	while (!str.empty()) {
		bytes = sendto(_sockfd, str.c_str(), MIN(str.length(), BUFFER_SIZE), 0, (struct sockaddr*) &_apiAddr, _apiSize);
		if (bytes < 0)
			throw std::system_error();
		str.erase(0, bytes);
	}
}
