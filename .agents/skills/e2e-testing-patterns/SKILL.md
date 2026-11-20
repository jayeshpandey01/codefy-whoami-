---
name: e2e-testing-patterns
description: Builds browser-level state models, handles automated Playwright navigation, intercepts and records API requests, and generates deterministic reproduction scripts and regression tests. Use when testing web frontend flows, automating browser state transitions, or generating E2E test artifacts.
---

# E2E Testing & Playwright Patterns Skill

This skill guides browser-level state modeling, live network request interception, and deterministic reproduction artifact generation. It turns transient UI or API anomalies into reproducible test cases (`reproduce.py` and `regression.spec.ts`) according to the BugBound methodology.

## 1. Browser-Level State Modeling

When automating browser exploration with Playwright, do not just crawl URLs. Model the user flow and track all client-side state:

```text
Landing Page
   ↓
Authentication (POST /api/login) -> capture cookies, localStorage JWT, CSRF tokens
   ↓
Dashboard State (GET /api/me)
   ↓
Resource Manipulation (POST /api/projects, PUT /api/projects/{id})
```

### Key State Properties to Capture
- **Tokens & Headers**: `Authorization: Bearer <token>`, `X-CSRF-Token`
- **Cookies**: Session cookies, `HttpOnly`, `SameSite` flags
- **Storage**: `window.localStorage` and `window.sessionStorage`
- **DOM & Navigation**: Redirect paths, input form structures, error banners

---

## 2. API Request Interception & Harvesting

Intercept every HTTP request triggered during automated navigation to build an API test corpus:

```typescript
// Playwright request interceptor pattern
page.on('request', request => {
  if (request.url().includes('/api/')) {
    console.log(`Captured: ${request.method()} ${request.url()}`);
    // Record method, url, postData, headers for fuzzing corpus
  }
});
```

---

## 3. Exploit Reproduction & Regression Generation

For every confirmed finding or bug, generate a deterministic reproduction bundle in `findings/<finding-id>/`:

```text
findings/
└── BB-YYYY-XXXX/
    ├── finding.json           # Structured finding metadata
    ├── evidence.json          # Captured request & response pairs
    ├── reproduce.py           # Self-contained Python reproduction script
    ├── regression.spec.ts     # Playwright E2E regression test
    └── regression_test.py     # Backend API unit/integration regression test
```

### Reference Templates
- [Reproduction Template Reference](./references/reproduction_template.md)
- [Example Python Reproduction Script](./examples/reproduce_template.py)
- [Example Playwright Regression Spec](./examples/regression_template.spec.ts)

