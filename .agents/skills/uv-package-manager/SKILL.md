---
name: uv-package-manager
description: Speeds up Python dependency resolution and virtual environment management using uv, and configures containerized local service staging (PostgreSQL, Redis, backend APIs) with Docker Compose. Use when managing python packages, setting up fast virtualenvs, or staging local test services.
---

# UV Package Manager & Local Service Staging Skill

Guides fast dependency management with Astral's `uv` and reproducible local staging with `docker-compose`.

## 1. Fast Python Environment Management with `uv`

`uv` is an extremely fast Python package manager and resolver.

### Common Workflows
- **Create Virtual Environment**:
  ```bash
  uv venv .venv
  source .venv/bin/activate
  ```
- **Install Packages**:
  ```bash
  uv pip install fastapi uvicorn pydantic pytest
  ```
- **Install from Requirements**:
  ```bash
  uv pip install -r requirements.txt
  ```
- **Lock and Sync Dependencies**:
  ```bash
  uv pip compile pyproject.toml -o requirements.lock
  uv pip sync requirements.lock
  ```

---

## 2. Docker Compose Staging Template

Staging dependencies (PostgreSQL + Redis) for deterministic local testing:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpassword
      POSTGRES_DB: bugbound_test
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U testuser -d bugbound_test"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

