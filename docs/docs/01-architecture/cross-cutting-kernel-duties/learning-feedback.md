---
title: Learning Feedback
description: Kernel duty for closing the loop from outcome to improvement.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Learning Feedback, improvement loop, outcome evaluation, RLHF]
sidebar_label: Learning Feedback
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Learning Feedback

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To ensure that every execution cycle contributes to the system's long-term improvement by capturing outcomes, evaluating performance, and feeding insights back into the model or policy.

## Lifecycle Coverage
*   **Execution**: Capture traces and results.
*   **Post-Execution**: Evaluate success/failure.
*   **Planning**: Use past learnings to improve future plans.

## Agent Scope (SA / MAP)
*   **SA**: Self-correction and few-shot example accumulation.
*   **MAP**: Shared learnings across agents, reputation scoring.

## Required Events
*   `LearningSampleCreated`
*   `FeedbackReceived`
*   `ModelUpdateApplied`

## Compliance Requirements
1.  Runtime MUST provide a mechanism to capture `LearningSamples`.
2.  Runtime MUST link outcomes (Success/Failure) to the original `Plan` and `Context`.
3.  Runtime SHOULD support persistent storage of feedback loops.

## Implementation Details (Non-Normative)

Learning Feedback is implemented via the **Learning Module**, which standardizes how execution history is captured for training.

### Learning Sample Structure
The `LearningSample` object (`learning/mplp-learning-sample-core.schema.json`) is the atomic unit of learning data:
- **`sample_family`**: Classifies the type of learning (e.g., `intent_resolution`, `pipeline_outcome`, `multi_agent_coordination`).
- **`input`**: Abstracted representation of the context *before* the action.
- **`output`**: The actual result or decision made.
- **`state`**: A snapshot of the relevant PSG state (roles, config) at the time of execution.
- **`meta`**: Quality signals, human feedback labels (`approved`, `rejected`), and provenance IDs.

This structure allows any MPLP execution trace to be converted into a dataset for fine-tuning or few-shot prompting.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-learning-sample-core.schema.json` | Defines a learning sample | `sample_id`, `input`, `output`, `state`, `meta` |

## Examples
*   **Auto-Correction**: An agent fails to generate valid JSON, receives an error, and adds that error to its negative constraints for the next attempt.
*   **Golden Flow Extraction**: Successful traces are promoted to "Golden Flows" for future reference.

