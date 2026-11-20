---
name: clean-code
description: Enforces SOLID design principles, clean naming conventions, modular function sizing, error handling boundaries, and maintainable software architecture. Use when writing, refactoring, or evaluating code quality across the codebase.
---

# Clean Code Guidelines Skill

Establishes engineering standards for readability, modularity, and maintainability across all languages in the project.

## 1. Core Principles

- **Single Responsibility (SRP)**: Each class, module, or function should have exactly one reason to change. Functions should do one thing well.
- **Explicit over Implicit**: Avoid magic strings, hidden side effects, and unexpressed assumptions.
- **Descriptive Naming**:
  - Functions: verb phrases (e.g., `calculate_risk_score`, `verify_authorization_boundary`).
  - Classes: nouns (e.g., `AttackSurfaceMapper`, `FindingEngine`).
  - Booleans: predicate prefixes (e.g., `is_authenticated`, `has_admin_privilege`).

## 2. Function Sizing & Modularity

- Target function lengths under 30–40 lines.
- Limit nesting depth to $\le 3$ levels; use early returns (guard clauses) to reduce cognitive complexity:
  ```python
  # Good: Guard clauses
  def process_evidence(evidence):
      if not evidence.is_valid:
          return False
      if evidence.is_duplicate:
          return False
      return save_finding(evidence)
  ```

## 3. Defensive Error Handling

- Catch specific exceptions, never bare `except:`.
- Preserve stack traces with exception chaining: `raise CustomServiceError("Failed to query DB") from err`.
- Never suppress errors silently without logging.

