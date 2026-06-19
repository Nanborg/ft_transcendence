CC = g++
CFLAGS = -c
LFLAGS = 

NAME = gameEngineRuntime

SRC = \
	run.cpp \
	GameEngine.cpp \
	ControllerIO.cpp \
	AbstractEntity.cpp \
	AbstractMovingEntity.cpp \

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

.PHONY: all clean fclean re
