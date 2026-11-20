---
name: research
description: Conducts comprehensive codebase investigation, architecture discovery, technical trade-off evaluations, documentation searches, and evidence gathering. Use when asked to investigate unfamiliar code, survey libraries, evaluate design decisions, or write technical research briefs.
---

# Codebase & Technical Research Skill

This skill guides deep, non-destructive investigation across unfamiliar codebases, architectural topologies, and external documentation. It ensures inquiries are systematic, hypothesis-driven, and grounded in verifiable references.

## 1. Investigation Workflow Cycle

```text
1. Formulate Hypothesis / Goal
       ↓
2. Scope & Target Identification (find relevant modules, symbols, entry points)
       ↓
3. Cross-Reference & Call Graph Tracing (callers, callees, data models)
       ↓
4. Evidence Synthesis & Verification
       ↓
5. Technical Research Brief Delivery
```

---

## 2. Codebase Discovery Strategies

### A. Broad Survey to Focused Deep-Dive
1. **Directory Tree Mapping**: Identify entry points, configs, services, models, and test suites.
2. **Key Symbol & Route Discovery**: Locate routers, API definitions, message consumers, and database tables.
3. **Execution Path Tracing**: Trace control flow from controller $\rightarrow$ service layer $\rightarrow$ data repository.

### B. Dependency & Architecture Mapping
- Map how components communicate (synchronous HTTP/gRPC, asynchronous message brokers, shared database).
- Identify shared state, caches (Redis), and background workers (Celery, RQ, background tasks).

---

## 3. Evidence-Grounded Research Rules

1. **Explicit File & Line Anchors**: Never state an architectural assumption without referencing the exact file path and line numbers (e.g., `[auth.py](file:///path/to/auth.py#L45-L60)`).
2. **Distinguish Verified Facts from Assumptions**:
   - **Verified**: Directly observed in the code or executed commands.
   - **Hypothesis**: Plausible inference that requires dynamic validation.
3. **Comparative Evaluation**: When researching alternative libraries or architectures, construct a structured trade-off matrix:
   - Performance & Latency
   - Complexity & Maintenance Overhead
   - Ecosystem Maturity & Security Maintenance

---

## 4. Research Brief Output Schema

Summarize findings into a structured technical research document following the [research_brief_template.md](./references/research_brief_template.md):

```markdown
# Technical Research Brief: [Topic / Problem Statement]

## Executive Summary
Concise 2-3 sentence overview of the investigation and core recommendation.

## Architecture & Codebase Map
- Entry Points: ...
- Data Flow: ...
- State & Persistence: ...

## Detailed Findings
[Grouped by component with exact file references]

## Trade-off Analysis & Recommendation
[Decision matrix comparing alternatives]
```

