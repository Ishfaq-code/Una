all: start

start:
	docker compose up

stop:
	docker compose down -v

restart: stop start

build:
	docker compose build

start-build:
	docker compose up --build

migrate:
	docker exec django_app python manage.py makemigrations

.PHONY: all start stop restart build start-build migrate