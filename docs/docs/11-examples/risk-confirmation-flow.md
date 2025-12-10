---
title: Risk Confirmation Flow
description: Example of human-in-the-loop risk confirmation in MPLP. Demonstrates high-risk step identification, Confirm object creation, and user approval workflows.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Risk Confirmation Flow, human-in-the-loop, MPLP confirmation, high-risk steps, user approval, Confirm object, execution gating]
sidebar_label: Risk Confirmation Flow
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Risk Confirmation Flow Example

> [!NOTE]
> **Status**:  Skeleton / Planned
> 
> This example is a placeholder. Full implementation will be available in a future release.

## 1. Overview

**Related Golden Flow**: `flow-05-single-agent-confirm-required-single-agent-confirm-required`

This example will demonstrate the human-in-the-loop confirmation pattern:
- High-risk step identification
- Confirm object creation
- User approval workflow
- Blocked execution until confirmed

## 2. Key Concepts

### 2.1 Confirm Object

The `Confirm` module gates execution of high-risk steps:

```typescript
const confirm = {
  confirm_id: "confirm-xxx",
  plan_id: "plan-xxx",
  step_ids: ["step-3"],  // Steps requiring approval
  status: "pending",      // pending | approved | rejected
  requested_at: "...",
  decision_by: null
};
```

### 2.2 Confirmation States

| Status | Execution Behavior |
|:---|:---|
| `pending` | Step blocked, awaiting user decision |
| `approved` | Step execution proceeds |
| `rejected` | Step skipped or plan aborted |

### 2.3 Flow Diagram

```
Plan Created Steps 1-2 Execute Step 3 (high-risk)  Confirm Created (status=pending)  User Approves Confirm (status=approved) Step 3 Executes User Rejects Confirm (status=rejected) Plan Aborted
```

## 3. Placeholder Implementation

No runnable example exists yet. See the Golden Flow tests for reference:

```
tests/golden/flows/flow-05-single-agent-confirm-required-single-agent-confirm-required/
```

## 4. Related Documentation

- [Confirm Module](../02-modules/confirm-module.md)
- [SA Profile Specification](../03-profiles/sa-profile.md)
- [Golden Flow Registry](../09-tests/golden-flow-registry.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
