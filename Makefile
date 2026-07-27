
all:
	sudo sh scripts/generate-dev-cert.sh
	docker compose up -d --build

up:
	docker compose up

test-backend:
	docker compose up backend --build --no-deps

down:
	docker compose down

logs:
	docker compose logs -f

fclean: down
	docker system prune -af

dev:
	docker compose up backend database --build

.PHONY: all up test-backend down logs fclean
