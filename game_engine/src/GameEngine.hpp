#ifndef GAMEENGINE_HPP
#define GAMEENGINE_HPP

class GameEngine
{
public:
	GameEngine();
	~GameEngine();
	void start();
	void stop();

private:
	bool _running;
	int _nextEntityId;
	int _teamId;
};

#endif
