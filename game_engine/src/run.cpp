#include "GameEngine.hpp"
#include <signal.h>

GameEngine *g_game;

static void sig_stop( int ) { g_game->stop(); }

int main( int argc, char const *argv[] ) {
	int port = 7297;
	if (argc > 1)
		port = atoi(argv[1]);
	std::cout << "Start engine on port " << port << "\n";
	// TODO(neon-05): Handle SIGTERM/SIGINT consistently and guarantee clean
	//shutdown in Docker environments.
	signal(SIGINT, sig_stop);
	GameEngine::registerAllTypes();
	GameEngine game (port);
	g_game = &game;
	game.init();
	game.start();
	return 0;
}
