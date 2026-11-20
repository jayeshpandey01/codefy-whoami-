---
name: api-design-principles
description: Standardizes RESTful endpoint structures, API versioning, HTTP status codes, middleware error formatting, and role-based access control (RBAC) mapping. Use when designing REST APIs, documenting endpoints, or standardizing request/response conventions.
---

# API Design Principles Skill

Provides strict conventions for RESTful API architecture, predictable HTTP status codes, and security-aware endpoint contracts.

## 1. RESTful URI Conventions

- Use plural nouns for resource collections: `/api/v1/projects`
- Express hierarchies naturally: `/api/v1/projects/{project_id}/tasks`
- Use sub-actions only when non-CRUD operations are necessary: `/api/v1/projects/{project_id}/archive`
- Never include verbs in URIs (e.g., avoid `/api/v1/getProjects` or `/api/v1/deleteUser`).

## 2. Standard HTTP Status Code Conventions

| Status Code | Usage |
| :--- | :--- |
| **200 OK** | Successful read, update, or action execution |
| **201 Created** | Successful resource creation (include `Location` header or created object) |
| **204 No Content** | Successful deletion or action with no return payload |
| **400 Bad Request** | Schema validation failure or malformed payload |
| **401 Unauthorized** | Missing or invalid authentication token |
| **403 Forbidden** | Valid authentication, but insufficient permissions |
| **404 Not Found** | Resource does not exist (or hidden for security) |
| **409 Conflict** | Duplicate resource or state collision (e.g. email already registered) |
| **422 Unprocessable**| Semantically invalid input (Pydantic validation errors) |
| **500 Internal Error**| Unexpected server failure (always mask internal stack traces) |

## 3. Consistent Error Envelope

All API errors must return a standardized JSON structure:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project with id 123 does not exist or is not accessible.",
    "details": [],
    "request_id": "req-897b61"
  }
}
```

