#include <sys/socket.h>
#include <netinet/in.h>
#include <iostream>

int main(int argc, char const *argv[])
{
	std::cout << "start\n";
	int port = 8888;
	int sockfd = socket(AF_INET, SOCK_DGRAM, 0);
	if (sockfd < 0)
		return 2;
	std::cout << "socket\n";
	char buffer[16];
	sockaddr_in server, api;
	socklen_t size = sizeof(api);
	server.sin_family = AF_INET;
	server.sin_port = htons(port);
	server.sin_addr.s_addr = INADDR_ANY;
	if (bind(sockfd, (struct sockaddr*) &server, sizeof(server)))
		return 2;
	std::cout << "bind\n";
	int len = recvfrom(sockfd, buffer, sizeof(buffer), NULL, (struct sockaddr*) &api, &size);
	std::cout << "received\n";
	if (len < 0)
		return 2;
	else
	{
		std::cout << buffer << '\n';
		sendto(sockfd, buffer, len, NULL, (struct sockaddr*) &api, size);
	}
	return 0;
}
