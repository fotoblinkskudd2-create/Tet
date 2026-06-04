.PHONY: install install-py install-backend install-frontend
.PHONY: test lint build clean

install: install-py install-backend install-frontend

install-py:
	pip install pytest

install-backend:
	cd backend && npm install

install-frontend:
	cd frontend && npm install

test:
	python -m pytest tests/ -v

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

build:
	cd backend && npm run build
	cd frontend && npm run build

clean:
	find . -name '__pycache__' -type d -exec rm -rf {} +
	find . -name '*.pyc' -delete
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/.next frontend/node_modules
