---
name: gitops-workflow
description: Automates version control operations, semantic branch policies, CI/CD pipeline triggers, reproduction branch staging, and automated artifact generation. Use when managing git workflows, branching strategies, and CI/CD automated test pipelines.
---

# GitOps & Reproduction Workflow Skill

Standardizes version control lifecycle, reproduction branches, and automated CI/CD pipeline triggers.

## 1. Reproduction & Finding Branch Conventions

When an evidence-driven vulnerability or regression is confirmed, isolate it into a dedicated finding branch:

```text
git checkout -b repro/BB-2026-0042-authz-project-id
```

### Commit Message Structure
Follow Conventional Commits:
```text
test(repro): reproduce BOLA on /api/projects/{id} (BB-2026-0042)

- Add standalone python reproduction script: findings/BB-2026-0042/reproduce.py
- Add failing Playwright spec: findings/BB-2026-0042/regression.spec.ts
```

## 2. CI/CD Integration Loop

Ensure CI pipelines run the reproduction suite:
1. **Pre-commit**: Static analysis (`scan_secrets_sinks.py`, linter, formatting).
2. **Pull Request**: Run unit tests and authorization matrix validation.
3. **Regression Suite**: Execute all `findings/**/regression_test.py` and `findings/**/regression.spec.ts` against staging environments.

