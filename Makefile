# Maia Chess – development helper

.PHONY: help setup-backend setup-frontend test-backend test-frontend lint format dev

help:
	@echo "Common development commands:"
	@echo "  make setup-backend   – install Python deps in current env"
	@echo "  make setup-frontend  – npm install front-end deps"
	@echo "  make test-backend    – run Python unit tests"
	@echo "  make test-frontend   – run Vitest suite"
	@echo "  make lint            – run Ruff + ESLint"
	@echo "  make format          – run Black & eslint --fix"
	@echo "  make dev             – run docker-compose in dev profile"

setup-backend:
	pip install --upgrade pip && pip install -r backend/requirements.txt

setup-frontend:
	cd frontend && npm ci

test-backend:
	cd backend && python -m unittest discover -v

test-frontend:
	cd frontend && npm run test

lint:
	python3 -m ruff check backend
	cd frontend && npm run lint || true

format:
	black .
	cd frontend && npm run lint -- --fix

dev:
	docker-compose --profile dev up