#include "GameEngine.hpp"

GameEngine *g_game;

int main(int argc, char const *argv[]) {
	std::cout << "start\n";
	int port = 8888;
	
	GameEngine::registerAllTypes();
	GameEngine game (port);
	g_game = &game;
	game.init();
	game.start();
	return 0;
}
