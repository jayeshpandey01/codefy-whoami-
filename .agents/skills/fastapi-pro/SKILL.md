---
name: fastapi-pro
description: Scaffolds high-performance asynchronous Python services using FastAPI, Pydantic v2, dependency injection, and asynchronous database connection pooling. Use when developing or refactoring FastAPI backends, designing API schemas, or configuring async ORM layers.
---

# FastAPI Pro Skill

This skill enforces high-performance asynchronous FastAPI architectures, robust dependency injection patterns, Pydantic v2 validation models, and resilient connection pooling.

## Key Architecture Principles

1. **Layered Directory Structure**:
   ```text
   app/
   ├── api/          # Route handlers / controllers
   ├── core/         # Settings, config, security
   ├── models/       # Database models (SQLAlchemy / SQLModel)
   ├── schemas/      # Pydantic v2 schemas (Request & Response)
   ├── services/     # Business logic layer
   └── main.py       # FastAPI application factory
   ```

2. **Pydantic v2 Request / Response Separation**:
   - Never return raw ORM entities directly. Always serialize with `response_model=SchemaOut` or `model_validate`.
   - Separate schemas into `Create`, `Update`, `InDB`, and `Public`.

3. **Dependency Injection**:
   - Use `Depends()` for database sessions, authentication, and service instances.
   - Ensure database sessions yield and close properly:
     ```python
     async def get_db() -> AsyncGenerator[AsyncSession, None]:
         async with async_session_factory() as session:
             try:
                 yield session
                 await session.commit()
             except Exception:
                 await session.rollback()
                 raise
     ```

4. **Async Lifecycle & Connection Pooling**:
   - Use `lifespan` context manager instead of deprecated `on_event("startup")`.
   - Configure pool pre-ping and reasonable pool sizes (`pool_size=10, max_overflow=20`).

