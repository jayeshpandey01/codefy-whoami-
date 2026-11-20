---
name: async-python-patterns
description: Optimizes concurrent task processing, background workers, event loop efficiency, and Redis/PostgreSQL async integration. Use when implementing asynchronous Python workflows, resolving blocking I/O bottlenecks, or managing concurrent background jobs.
---

# Async Python Patterns Skill

Provides guidelines for high-throughput asynchronous Python applications using `asyncio`, non-blocking I/O, task groups, and resilient background queues.

## 1. Avoid Blocking the Event Loop

- **Never** call synchronous I/O functions (`time.sleep()`, synchronous `requests.get()`, synchronous disk reads) inside `async def` routines.
- If synchronous calls or CPU-bound tasks are unavoidable, offload them:
  ```python
  import asyncio
  
  # Offload blocking operations to thread pool
  result = await asyncio.to_thread(cpu_intensive_or_sync_io_func, arg1, arg2)
  ```

## 2. Structured Concurrency with Task Groups (Python 3.11+)

Always prefer `asyncio.TaskGroup()` over unstructured `asyncio.gather()` or floating `asyncio.create_task()`:

```python
async def fetch_all_targets(targets: list[str]):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_target(t)) for t in targets]
    return [task.result() for task in tasks]
```

## 3. Concurrency Limiting (Semaphores)

Prevent resource starvation or rate-limit exhaustion when launching batch requests:

```python
sem = asyncio.Semaphore(10)  # Max 10 concurrent requests

async def safe_fetch(url: str):
    async with sem:
        return await client.get(url)
```

## 4. Async Database & Redis Connections

- Use `asyncpg` with SQLAlchemy `create_async_engine`.
- Use `redis.asyncio` for pub/sub and distributed caching.
- Always close pools gracefully during application shutdown.

