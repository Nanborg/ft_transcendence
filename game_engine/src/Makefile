CC = g++
CFLAGS = -I.
LFLAGS =

NAME = gameEngineRuntime

ENTITIES = \
	entities/PlayerEntity.cpp \
	entities/WallEntity.cpp \
	entities/WalkingGoobEntity.cpp \
	entities/ShootingGoobEntity.cpp \
	entities/TankGoobEntity.cpp \
	entities/LordGoobEntity.cpp \
	entities/LaserSlashEntity.cpp \
	entities/LaserProjectileEntity.cpp \
	entities/LaserShieldEntity.cpp \
	entities/BossProjectileEntity.cpp \
	entities/EnemyProjectileEntity.cpp \
	entities/BossLaserProjectileEntity.cpp \
	entities/EnemyMeleeEntity.cpp \
	entities/CheckpointEntity.cpp \
	entities/SpawnPointEntity.cpp \

SRC = \
	run.cpp \
	GameEngine.cpp \
	GameEngineLoop.cpp \
	GameEngineInput.cpp \
	ControllerIO.cpp \
	AbstractEntity.cpp \
	AbstractMovingEntity.cpp \
	AbstractHitboxEntity.cpp \
	$(ENTITIES) \

OBJ = $(SRC:.cpp=.o)

all: $(NAME)

$(NAME): $(OBJ)
	$(CC) $(LFLAGS) $(OBJ) -o $@

%.o: %.cpp
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf $(OBJ)

fclean: clean
	rm -rf $(NAME)

re: fclean all

# TODO(neon-05): Add a 'lint-style' target (whitespace + style) to prevent
#regressions detected by git diff --check.

.PHONY: all clean fclean re
