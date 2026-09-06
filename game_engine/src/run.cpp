#include <signal.h>
#include <string>
#include <queue>

#include <iostream>
#include <json.hpp>
#include <GameEngine.hpp>
#include <ControllerIO.hpp>

#define USPT_TARGET 100000
int g_uspt;
ControllerIO *g_io;
GameEngine *g_game;
typedef std::map<std::string, GameEngine> games_list;
bool running = true;

static void sig_stop(int) { running = false; }

static void send_room_status(const std::string &roomId, const std::string &type)
{
	json out;
	out["type"] = type;
	out["roomId"] = roomId;
	for (int i = 0; i < 3; i++)
		g_io->sendMsg(out.dump());
}

void receive_inputs(ControllerIO &io, std::queue<json> &inputs)
{
	while (io.pollApi() > 0)
		inputs.push(io.getMsg());
}

static void input_r_create(games_list &games, const json &in)
{
	if (games.count(in["roomId"]) == 0)
	{
		games_list::iterator it = games.emplace(in["roomId"], in["roomId"]).first;
		g_game = &it->second;
		bool initialized = it->second.init(in);
		g_game = NULL;
		if (!initialized)
		{
			games.erase(in["roomId"]);
			send_room_status(in["roomId"], "roomInitFailed");
			std::cout << "room " << in["roomId"] << " init failed" << std::endl;
			return;
		}
		send_room_status(in["roomId"], "roomReady");
		std::cout << "room " << in["roomId"] << " created" << std::endl;
	}
	else
		send_room_status(in["roomId"], "roomReady");
}

static void input_r_destroy(games_list &games, const json &in)
{
	if (games.count(in["roomId"]) > 0)
	{
		games.erase(in["roomId"]);
		std::cout << "roomId " << in["roomId"] << " deleted" << std::endl;
	}
}

static void input_r_start(games_list &games, const json &in)
{
	if (games.count(in["roomId"]) > 0)
	{
		games.at(in["roomId"]).start();
		std::cout << "roomId " << in["roomId"] << " now running" << std::endl;
	}
}

static void input_r_stop(games_list &games, const json &in)
{
	std::string reason = "engine_error";
	if (in.contains("reason") && in["reason"].is_string()) {
		reason = in["reason"];
	}
	if (games.count(in["roomId"]) > 0)
	{
		games.at(in["roomId"]).stop(reason);
		std::cout << "roomId " << in["roomId"] << " now stopped" << std::endl;
	}
}

static void input_r_distribute(games_list &games, const json &in)
{
	if (games.count(in["roomId"]) > 0)
		games.at(in["roomId"]).pushInput(in);
}

void handle_inputs(std::queue<json> &inputs, games_list &games)
{
	json in;
	while (!inputs.empty())
	{
		in = inputs.front();
		std::cout << in.dump() << std::endl;
		inputs.pop();
		if (!in["type"].is_number() || !in["roomId"].is_string())
			continue;
		int type = in["type"];
		switch (type)
		{
		case InputTypes::R_CREATE:
			input_r_create(games, in);
			break;

		case InputTypes::R_DESTROY:
			input_r_destroy(games, in);
			break;

		case InputTypes::R_START:
			input_r_start(games, in);
			break;

		case InputTypes::R_STOP:
			input_r_stop(games, in);
			break;

		default:
			input_r_distribute(games, in);
			break;
		}
	}
}

int main(int argc, char const *argv[])
{
	int port = 7297;
	if (argc > 1)
		port = atoi(argv[1]);
	std::cout << "Start engine on port " << port << "\n";
	// signals only for testing
	signal(SIGINT, sig_stop);
	signal(SIGTERM, sig_stop);

	std::queue<json> inputs;
	games_list games;
	ControllerIO io(port);
	g_io = &io;

	while (running)
	{
		auto begin = std::chrono::steady_clock::now();
		receive_inputs(io, inputs);
		handle_inputs(inputs, games);
		for (games_list::iterator it = games.begin(); it != games.end(); it++)
		{
			if (it->second.isRunning())
				it->second.tick();
		}
		auto end = std::chrono::steady_clock::now();

		g_uspt = std::chrono::duration_cast<std::chrono::microseconds>(end - begin).count();
		int sleep_time = USPT_TARGET - g_uspt;
		if (sleep_time > 0)
			usleep(sleep_time);
	}
	return 0;
}
