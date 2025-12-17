---
title: Multi Agent Collab Flow
description: Example of Multi-Agent Collaboration (MAP) patterns in MPLP.
  Demonstrates multiple agents collaborating on a shared plan with role-based
  execution and coordination.
keywords:
  - Multi Agent Collab Flow
  - MAP patterns
  - multi-agent collaboration
  - role-based execution
  - agent coordination
  - MPLP examples
sidebar_label: Multi Agent Collab Flow
doc_status: informative
doc_role: example
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-collab.schema.json
      local_path: packages/sdk-ts/schemas/mplp-collab.schema.json
      binding: heuristic_name_match
  invariant_refs: []
  golden_refs:
    - local_path: tests/golden/flows/flow-02-single-agent-large-plan
      binding: mention
    - local_path: tests/golden/flows/flow-01-single-agent-plan
      binding: mention
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Multi-Agent Collaboration Flow Example

> [!NOTE]
> **Status**:  Skeleton / Planned for Phase P7
> 
> This example contains the architectural skeleton for Multi-Agent collaboration.
> Full implementation will be completed after coordination contracts and Golden Flows are finalized.

## 1. Overview

**Location**: `examples/ts-multi-agent-collab/`

**Related Golden Flows**: `map-flow-01-single-agent-plan-turn-taking`, `map-flow-02-single-agent-large-plan-broadcast-fanout`

This example demonstrates Multi-Agent Protocol (MAP) patterns:
- Multiple independent Agents collaborating on a shared Plan
- Role-based execution (Planner, Executor, Reviewer)
- Collab object for coordination state
- Network layer for agent communication

## 2. Directory Structure

```
examples/ts-multi-agent-collab/
 src/    index.ts          # Entry point (skeleton)
 package.json
 tsconfig.json
 README.md
```

## 3. Architectural Design

### 3.1 Agent Roles

| Role | Responsibility |
|:---|:---|
| **Planner** | Analyzes context, generates Plan |
| **Executor** | Executes specific steps |
| **Reviewer** | Validates outcomes, provides feedback |

### 3.2 Coordination Flow

```
1. Network Handshake Agents establish session, exchange Role
2. Plan Creation Planner generates Plan from Context
3. Confirmation Plan submitted for approval
4. Execution Executor runs steps, updates Collab
5. Completion Final state synchronized
```

### 3.3 Key Modules

- **Role**: Defines agent capabilities and permissions
- **Collab**: Tracks collaboration state and turn-taking
- **Network**: Handles inter-agent communication
- **Dialog**: Manages message exchange between agents

## 4. Current Implementation

```typescript
// examples/ts-multi-agent-collab/src/index.ts
console.log("Multi-Agent Collaboration Flow - Coming Soon in Phase P7");
```

## 5. Running the Skeleton

```bash
cd examples/ts-multi-agent-collab
pnpm install
pnpm start
```

## 6. Related Documentation

- [MAP Profile Specification](../03-profiles/map-profile.md)
- [Collab Module](../02-modules/collab-module.md)
- [Network Module](../02-modules/network-module.md)
- [Golden Flow Registry](../09-tests/golden-flow-registry.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
