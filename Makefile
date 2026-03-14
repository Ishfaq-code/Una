COMPOSE_FILE=docker-compose.yml
DOCKER_COMPOSE=docker compose -f $(COMPOSE_FILE)

build: ## Build all Docker images
	@echo "Building Una Docker images"
	@$(DOCKER_COMPOSE) build

build-nocache: ## Build all Docker images
	@echo "Building Una Docker images, no cahce"
	@$(DOCKER_COMPOSE) build --no-cache

build-frontend: 
	@echo "Building una/frontend"
	@$(DOCKER_COMPOSE) build frontend

build-backend: 
	@echo "Building una/backend"
	@$(DOCKER_COMPOSE) build db backend

start:
	@echo "Starting Una"
	@$(DOCKER_COMPOSE) up 

stop:
	@echo "Stopping Una"
	@$(DOCKER_COMPOSE) stop

down:
	@echo "Downing Una Containers"
	@$(DOCKER_COMPOSE) down -v

start-frontend:
	@echo "Starting Una frontend"
	@$(DOCKER_COMPOSE) up frontend

stop-frontend:
	@echo "Stopping Una frontend"
	@$(DOCKER_COMPOSE) stop frontend

start-backend:
	@echo "Starting Una backend"
	@$(DOCKER_COMPOSE) up db backend

stop-backend:
	@echo "Stopping Una backend"
	@$(DOCKER_COMPOSE) stop db backend

create-superuser:
	docker exec -it django_app python manage.py createsuperuser

migrate:
	docker exec django_app python manage.py makemigrations

runmigrations:
	docker exec django_app python manage.py migrate

.PHONY: help create-superuser migrate runmigrations
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
