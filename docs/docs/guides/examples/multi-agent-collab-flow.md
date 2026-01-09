---
sidebar_position: 6

doc_type: reference
normativity: informative
title: Multi-Agent Collaboration Flow
description: Example showing multi-agent collaboration patterns using MPLP MAP Profile.
sidebar_label: Multi-Agent Collaboration
status: active
authority: Documentation Governance
canonical: /docs/guides/examples/multi-agent-collab-flow

---



# Multi-Agent Collaboration Flow


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

- [MAP Profile Specification](/docs/specification/profiles/map-profile.md)
- [Collab Module](/docs/specification/modules/collab-module.md)
- [Network Module](/docs/specification/modules/network-module.md)
- [Golden Flow Registry](/docs/evaluation/golden-flows/index.mdx)