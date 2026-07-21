#include "GameEngine.hpp"
#include <signal.h>

# define USPT_TARGET 100000
int	g_uspt;
GameEngine* g_game;
typedef std::map<std::string, GameEngine>::iterator games_it;
bool running = true;

static void sig_stop( int ) { running = false; }

void receive_inputs( ControllerIO& io, std::queue<json>& inputs ) {
	while (io.pollApi() > 0)
		inputs.push(io.getMsg());
}

static void	input_r_create( std::map<std::string, GameEngine>& games, const json& in ) {
	games.emplace(in["room"]);
}

static void	input_r_destroy( std::map<std::string, GameEngine>& games, const json& in ) {
	if (games.count(in["room"]) > 0)
		games.erase(in["room"]);
}

static void	input_r_start( std::map<std::string, GameEngine>& games, const json& in ) {
	if (games.count(in["room"]) > 0)
		games[in["room"]].start();
}

static void	input_r_stop( std::map<std::string, GameEngine>& games, const json& in ) {
	if (games.count(in["room"]) > 0)
		games[in["room"]].stop();
}

static void input_r_distribute( std::map<std::string, GameEngine>& games, const json& in ) {
	if (games.count(in["room"]) > 0)
		games[in["room"]].pushInput(in);
}

void handle_inputs( std::queue<json>& inputs, std::map<std::string, GameEngine>	games ) {
	json in;
	while (!inputs.empty())
	{
		in = inputs.front();
		inputs.pop();
		if (!in["type"].is_number() || !in["room"].is_string())
			continue;
		int type = in["type"];
		switch (type)
		{
		case inputTypes_e::R_CREATE:
			input_r_create(games, in);
			break;

		case inputTypes_e::R_DESTROY:
			input_r_destroy(games, in);
			break;

		case inputTypes_e::R_START:
			input_r_start(games, in);
			break;

		case inputTypes_e::R_STOP:
			input_r_stop(games, in);
			break;

		default:
			input_r_distribute(games, in);
			break;
		}
	}

	return;
	int type = in["type"];
}

int main( int argc, char const *argv[] ) {
	int port = 7297;
	if (argc > 1)
	port = atoi(argv[1]);
	std::cout << "Start engine on port " << port << "\n";
	// signals only for testing
	signal(SIGINT, sig_stop);
	signal(SIGTERM, sig_stop);
	std::queue<json>					inputs;
	std::map<std::string, GameEngine>	games;
	ControllerIO						io (port);
	io;

	while (running) {
		auto begin = std::chrono::steady_clock::now();
		receive_inputs(io, inputs);
		handle_inputs(inputs, games);
		for (games_it it = games.begin(); it != games.end(); it++) {
			if (it->second.isRunning())
			it->second.tick();
		}
		auto end = std::chrono::steady_clock::now();

		g_uspt = std::chrono::duration_cast<std::chrono::microseconds>(end-begin).count();
		int sleep_time = USPT_TARGET - g_uspt;
		if (sleep_time > 0)
			usleep(sleep_time);
	}
	return 0;
}
