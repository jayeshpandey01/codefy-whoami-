---
name: code-review-ai
description: Enforces defensive programming, audits authorization boundaries, creates RBAC access matrices, and guides differential testing between identities to detect IDOR, BOLA, and privilege escalation vulnerabilities. Use during pull request code reviews, authorization security assessments, and logic flow verification.
---

# Code Review & Authorization Boundary Skill

This skill enforces defensive programming best practices, inspects access control mechanisms, and systematically audits authorization boundaries using the BugBound differential identity testing model.

## 1. Authentication & Role Modeling

Before reviewing endpoint controllers or handlers, map out the hierarchy of identities:

```text
Identities:
├── Anonymous (Unauthenticated)
├── User A (Tenant 1 Resource Owner)
├── User B (Tenant 2 Peer / Non-owner)
└── Admin (Superuser / Elevated Role)
```

Construct an Access Matrix for every sensitive endpoint:

| Endpoint | Method | Anonymous | User A | User B | Admin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Allow (200) | Allow (200) | Allow (200) | Allow (200) |
| `/api/projects/{id}` | GET | Deny (401) | Allow (200) | **Deny (403)** | Allow (200) |
| `/api/projects/{id}` | DELETE | Deny (401) | Allow (200) | **Deny (403)** | Allow (200) |
| `/api/admin/users` | GET | Deny (401) | Deny (403) | Deny (403) | Allow (200) |

---

## 2. Differential Testing Sequence (IDOR / BOLA Detection)

Differential testing checks if changing the caller's identity while keeping the target resource constant yields an unauthorized response:

1. **Baseline**: User A creates Resource `#100`. Verify User A can fetch `#100` (`200 OK`).
2. **Differential Request**: User B issues a `GET /api/projects/100` using User B's token.
3. **Evaluation**:
   - If response is `403 Forbidden` or `404 Not Found` -> **Secure Access Control Enforced**.
   - If response is `200 OK` and contains User A's data -> **Confirmed IDOR/BOLA Vulnerability**.

---

## 3. Defensive Code Review Checklist

During PR review, verify these critical defensive patterns:

- [ ] **Explicit Tenant/User Scoping**: Does the query filter on current authenticated user context?
  - *Bad*: `SELECT * FROM projects WHERE id = :id`
  - *Good*: `SELECT * FROM projects WHERE id = :id AND organization_id = :current_org_id`
- [ ] **Fail Closed**: Do authorization decorators/middlewares default to denying access when roles are ambiguous or omitted?
- [ ] **Input Sanitization & Schema Validation**: Are all request parameters validated by Pydantic models or TypeScript schemas?
- [ ] **Proper HTTP Status Codes**: 401 for missing/invalid auth, 403 for insufficient permissions, 404 for nonexistent resources or hidden resources to prevent enumeration.

See [rbac_matrix_guide.md](./references/rbac_matrix_guide.md) for full authorization audit patterns.

