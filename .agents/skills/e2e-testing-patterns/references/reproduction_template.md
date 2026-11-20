# Reproduction & Evidence Bundle Specification

When a test failure or security finding is validated, assemble the following deterministic bundle:

## 1. `finding.json`
```json
{
  "id": "BB-2026-0042",
  "title": "Broken object-level authorization on projects endpoint",
  "severity": "high",
  "asset": "/api/projects/{id}",
  "confidence": 0.98,
  "verified": true,
  "runtime_evidence": {
    "actor": "user_B",
    "object_owner": "user_A",
    "status": 200
  },
  "reproduction": {
    "python": "reproduce.py",
    "playwright": "regression.spec.ts"
  }
}
```

## 2. Reproduction Rules
1. **Zero External Hallucination**: Do not invent test parameters. Use exact recorded bodies and headers from dynamic execution.
2. **Deterministic Assertions**:
   - `reproduce.py` asserts the current faulty behavior (e.g., `assert response.status_code == 200` proving leak).
   - `regression.spec.ts` asserts the expected secure behavior (e.g., `expect(response.status()).toBe(403)` or `expect(response.status()).toBe(404)`).

