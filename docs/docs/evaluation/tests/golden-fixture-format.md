---
sidebar_position: 3
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-TEST-FIXTURE-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Golden Fixture Format
sidebar_label: Fixture Format
description: "MPLP test documentation: Golden Fixture Format. Test suite structure and fixtures."
authority: Documentation Governance
---

# Golden Fixture Format

## 1. Directory Structure

The Golden Test Suite is organized by Flow ID in the `tests/golden/flows/` directory. Each flow has a dedicated subdirectory containing input and expected output fixtures.

```txt
tests/golden/flows/
 flow-01-single-agent-plan/
    README.md              # Flow description
    input/
     context.json       # Initial context state
     plan.json          # Initial plan state
    expected/
     context.json       # Expected final context state
     plan.json          # Expected final plan state
```

## 2. Input Format (`input/`)

The `input/` directory contains the starting state or parameters for the flow. These files represent the **deterministic inputs** for a test scenario.

## 3. Output Format (`expected/`)

The `expected/` directory contains the **reference output** that represents a correct execution of the flow.

### 3.1 Protocol Objects
- `context.json`: Final context state
- `plan.json`: Final plan state

### 3.2 Module-Specific Objects
- `confirm.json`: For flows involving confirmation
- `trace.json`: For flows that emit trace spans
- `collab.json`: For MAP collaboration flows

## 4. Comparison Semantics

When using these fixtures for verification, the following semantic rules apply:

### 4.1 Object Equality
- **Deep Equality**: JSON objects are expected to match key-by-key.
- **Missing Keys**: A missing key in the actual output relative to the expected fixture indicates a divergence.

### 4.2 Ignored Fields
Certain fields are non-deterministic and are typically excluded from direct value comparison (though their format must still be valid):
- **IDs**: `context_id`, `plan_id`, `trace_id` (generated at runtime).
- **Timestamps**: `created_at`, `updated_at`.
- **Runtime Metadata**: `run_id`, `correlation_id`.

## 5. Relationship to Standards

This format aligns with the Schema Mapping Standard and provides concrete examples of valid protocol objects.