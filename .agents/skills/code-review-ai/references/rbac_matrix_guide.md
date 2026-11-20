# RBAC & Authorization Matrix Guide

Use this guide to systematically audit authorization logic and identify Broken Object Level Authorization (BOLA) and Broken Function Level Authorization (BFLA).

## Matrix Construction Template

```markdown
### Target: [Module Name / Service]

| Method | Endpoint Path | Source Handler | Expected Roles | Query Scoping Filter |
|---|---|---|---|---|
| GET | `/api/teams/{team_id}` | `getTeam` | Member, Admin | `teams.id == team_id && teams.org_id == user.org_id` |
| POST | `/api/teams/{team_id}/invite` | `inviteMember` | Admin | `user.is_admin == True` |
```

## Audit Questions for Each Endpoint
1. **Can an unauthenticated actor access this?** (Test without `Authorization` header).
2. **Can a valid user from Organization A access Organization B's data?** (Multi-tenancy isolation).
3. **Can an unprivileged user invoke an administrative action?** (Function-level authorization check).
4. **Is the ID predictable?** (Sequential integers vs UUIDv4/ULID). Predictable IDs significantly increase BOLA impact.

