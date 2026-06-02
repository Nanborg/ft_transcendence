
all: up

up:
	docker compose up --build

test-backend:
	docker compose up backend --build --no-deps

down:
	docker compose down

logs:
	docker compose logs -f

fclean: down
	docker system prune -af

.PHONY: all up test-backend down logs fclean