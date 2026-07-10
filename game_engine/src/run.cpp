#include "GameEngine.hpp"
#include <signal.h>

GameEngine *g_game;

static void sig_stop( int ) { g_game->stop(); }

int main( int argc, char const *argv[] ) {
	int port = 7297;
	if (argc > 1)
		port = atoi(argv[1]);
	std::cout << "Start engine on port " << port << "\n";

	signal(SIGINT, sig_stop);
	signal(SIGTERM, sig_stop);
	GameEngine game (port);
	g_game = &game;
	game.init();
	game.start();
	return 0;
}
