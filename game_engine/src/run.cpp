#include <signal.h>
#include "json.hpp"
#include <string>
#include <queue>
#include "GameEngine.hpp"
#include "ControllerIO.hpp"

# define USPT_TARGET 100000
int				g_uspt;
ControllerIO*	g_io;
GameEngine*		g_game;
typedef std::map<std::string, GameEngine> games_list;
bool running = true;

static void sig_stop( int ) { running = false; }

void receive_inputs( ControllerIO& io, std::queue<json>& inputs ) {
	while (io.pollApi() > 0)
		inputs.push(io.getMsg());
}

static void	input_r_create( games_list& games, const json& in ) {
	if (games.count(in["room"]) == 0) {
		games.emplace(in["room"], in["room"]);
		std::cout << "room " << in["room"] << " created" << std::endl;
	}
}

static void	input_r_destroy( games_list& games, const json& in ) {
	if (games.count(in["room"]) > 0) {
		games.erase(in["room"]);
		std::cout << "room " << in["room"] << " deleted" << std::endl;
	}
}

static void	input_r_start( games_list& games, const json& in ) {
	if (games.count(in["room"]) > 0) {
		games.at(in["room"]).start();
		std::cout << "room " << in["room"] << " now running" << std::endl;
	}
}

static void	input_r_stop( games_list& games, const json& in ) {
	if (games.count(in["room"]) > 0) {
		games.at(in["room"]).stop();
		std::cout << "room " << in["room"] << " now stopped" << std::endl;
	}
}

static void input_r_distribute( games_list& games, const json& in ) {
	if (games.count(in["room"]) > 0)
		games.at(in["room"]).pushInput(in);
}

void handle_inputs( std::queue<json>& inputs, games_list& games ) {
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
}

int main( int argc, char const *argv[] ) {
	int port = 7297;
	if (argc > 1)
	port = atoi(argv[1]);
	std::cout << "Start engine on port " << port << "\n";
	// signals only for testing
	signal(SIGINT, sig_stop);
	signal(SIGTERM, sig_stop);



	std::queue<json>	inputs;
	games_list			games;
	ControllerIO		io (port);
	g_io = &io;

	while (running) {
		auto begin = std::chrono::steady_clock::now();
		receive_inputs(io, inputs);
		handle_inputs(inputs, games);
		for (games_list::iterator it = games.begin(); it != games.end(); it++) {
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
