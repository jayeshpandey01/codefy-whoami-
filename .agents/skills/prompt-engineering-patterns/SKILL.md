---
name: prompt-engineering-patterns
description: Enforces strict system instructions, structured output schemas (JSON/Pydantic enforcement), and few-shot optimization patterns. Use when designing LLM prompts, building structured triage pipelines, or enforcing deterministic model outputs.
---

# Prompt Engineering Patterns Skill

Standardizes deterministic prompt design, output constraints, and few-shot calibration for autonomous agents.

## 1. Core Rule: Determinism over Ambiguity

Always decouple reasoning from final structured payload output:
- Use strict JSON Schema or Pydantic output definitions.
- Provide explicit boundary conditions (what NOT to do).
- Instruct the model to fail safely or output empty structures when evidence is absent, rather than hallucinating plausible answers.

## 2. Structured Triage Prompt Pattern

Example prompt for BugBound's evidence triage layer:

```text
You are an evidence triage evaluator. You evaluate raw execution evidence against an API endpoint.
You MUST output ONLY valid JSON adhering to the following schema.

Schema:
{
  "finding_id": "string",
  "verdict": "CONFIRMED_VULNERABILITY" | "EXPECTED_BEHAVIOR" | "INCONCLUSIVE",
  "confidence_score": float (0.0 to 1.0),
  "rationale": "concise explanation of proof"
}

Ground truth rules:
1. If status is 401 or 403, verdict MUST be EXPECTED_BEHAVIOR.
2. If status is 200 AND Actor B accessed Actor A's private data, verdict MUST be CONFIRMED_VULNERABILITY.
3. If response is ambiguous, verdict MUST be INCONCLUSIVE.
```

## 3. Few-Shot Demonstration Technique

Provide balanced examples (one positive, one negative, one edge-case) directly within the prompt or system instructions to calibrate the model's decision boundaries.

