CC = g++
CFLAGS = -c
LFLAGS =

NAME = gameEngineRuntime

SRC = \
	run.cpp \
	GameEngine.cpp \
	GameEngineLoop.cpp \
	GameEngineInput.cpp \
	ControllerIO.cpp \
	AbstractEntity.cpp \
	AbstractMovingEntity.cpp \
	PlayerEntity.cpp \
	WallEntity.cpp \

OBJ = $(SRC:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJ)
	$(CC) $(LFLAGS) $(OBJ) -o $@

%.o: %.cpp
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf $(OBJ)

fclean: clean
	rm -rf $(NAME)

re: fclean all
# TODO(neon-05): Add a 'lint-style' target (whitespace + style) to prevent
#regressions detected by git diff --check.
.PHONY: all clean fclean re
