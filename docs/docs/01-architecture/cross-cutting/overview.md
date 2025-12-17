---
title: Cross-Cutting Concerns Overview
description: Overview of 15 cross-cutting concerns in MPLP v1.0 spanning all
  layers and modules. Covers infrastructure, coordination, data integrity,
  quality, and security concerns.
keywords:
  - cross-cutting concerns
  - MPLP concerns
  - AEL
  - VSL
  - coordination
  - orchestration
  - security
  - performance
  - observability
sidebar_label: Overview
doc_status: normative
doc_role: normative_spec
protocol_version: 1.0.0
spec_level: CrossCutting
normative_id: MPLP-CC-OVERVIEW
permalink: /architecture/cross-cutting/overview
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-core.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Cross-Cutting Concerns Overview

## 1. Purpose

Cross-cutting concerns are architectural aspects that span all four layers (L1-L4) and multiple modules. Unlike modules which have distinct boundaries (e.g., Plan Module manages plans), cross-cutting concerns affect the **entire system** horizontally. This document provides an overview of all 15 cross-cutting concerns in MPLP v1.0.

## 2. Why Cross-Cutting Concerns Matter

**Traditional Modular Design**: Each module encapsulates specific functionality
- Context Module Project scope
- Plan Module Execution steps
- Trace Module Audit logs

**Cross-Cutting Concerns**: Cut across all modules
- **Security** affects Context (access control), Plan (approval gates), Trace (audit logging)
- **Performance** affects all modules (latency tracking, optimization)
- **Observability** affects all modules (event emission, structured logging)

**Challenge**: Without explicit cross-cutting design, these concerns become:
- **Scattered**: Security code duplicated in every module
- **Tangled**: Business logic mixed with infrastructure code
- **Inconsistent**: Different modules handle errors differently

**MPLP Solution**: Define cross-cutting concerns as first-class protocol aspects

## 3. The 15 Cross-Cutting Concerns

### 3.1 Core 9 Concerns (from `metadata.schema.json`)

These 9 concerns are **enumerated** in the protocol metadata schema (`schemas/v2/common/metadata.schema.json` lines 83-93):

```json
{
  "cross_cutting": {
    "type": "array",
    "items": {
      "type": "string",
      "enum": [
        "coordination",
        "error-handling",
        "event-bus",
        "orchestration",
        "performance",
        "protocol-version",
        "security",
        "state-sync",
        "transaction"
      ]
    }
  }
}
```

Modules **opt-in** to concerns via `meta.cross_cutting[]` array in their schema.

### 3.2 Extended 6 Concerns (Documentation Layer)

These 6 concerns are documented in `cross-cutting/` but not in the metadata enum:

10. **AEL** (Action Execution Layer)
11. **VSL** (Value State Layer)
12. **Observability** (broader than event-bus)
13. **Learning Feedback**
14. **Protocol Versioning** (detailed version of protocol-version)
15. **Overview** (this document)

**Total**: 9 (in enum) + 6 (documentation only) = 15 files in `cross-cutting/`

## 4. Concern Categories

### 4.1 Infrastructure Concerns

**Purpose**: Abstract runtime implementation details

| Concern | File | Purpose |
|:---|:---|:---|
| **AEL** | [ael.md](ael.md) | Action execution abstraction (LLM calls, tools) |
| **VSL** | [vsl.md](vsl.md) | State persistence abstraction (storage backends) |
| **Event Bus** | [event-bus.md](event-bus.md) | Event routing and dispatch |

### 4.2 Coordination Concerns

**Purpose**: Manage multi-agent and multi-module interactions

| Concern | File | Purpose |
|:---|:---|:---|
| **Coordination** | [coordination.md](coordination.md) | Multi-agent handoffs, turn-taking |
| **Orchestration** | [orchestration.md](orchestration.md) | Plan step sequencing, dependency resolution |
| **State Sync** | [state-sync.md](state-sync.md) | PSG consistency across distributed components |

### 4.3 Data Integrity Concerns

**Purpose**: Ensure correctness and reliability

| Concern | File | Purpose |
|:---|:---|:---|
| **Transaction** | [transaction.md](transaction.md) | Atomic state changes, rollback |
| **Error Handling** | [error-handling.md](error-handling.md) | Failure detection, recovery, compensation |

### 4.4 Quality Concerns

**Purpose**: Monitor and optimize system behavior

| Concern | File | Purpose |
|:---|:---|:---|
| **Performance** | [performance.md](performance.md) | Latency, throughput, token cost tracking |
| **Observability** | [observability.md](observability.md) | 12 event families, structured logging |
| **Learning Feedback** | [learning-feedback.md](learning-feedback.md) | RLHF/SFT sample collection |

### 4.5 Security & Compliance Concerns

**Purpose**: Protect data and ensure protocol adherence

| Concern | File | Purpose |
|:---|:---|:---|
| **Security** | [security.md](security.md) | Access control, encryption, sandboxing |
| **Protocol Version** | [protocol-versioning.md](protocol-versioning.md) | Version compatibility, migration |
| **Protocol Versioning** | [protocol-versioning.md](protocol-versioning.md) | Detailed versioning strategy |

## 5. How Concerns Are Applied

### 5.1 Opt-In Mechanism (L1)

**Schemas declare concerns** in `meta.cross_cutting[]`:

```json
{
  "plan_id": "plan-123",
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "2.0.0",
    "cross_cutting": ["security", "transaction", "performance"]
  }
}
```

**Effect**: Runtime knows this Plan requires:
- **Security**: Access control checks before execution
- **Transaction**: Atomic updates to PSG
- **Performance**: Latency/cost tracking

### 5.2 Runtime Implementation (L3)

**Runtime reads concerns and applies policies**:

```typescript
async function executePlan(plan: Plan, runtime: Runtime) {
  const concerns = plan.meta.cross_cutting || [];
  
  // Apply security concern
  if (concerns.includes('security')) {
    await runtime.checkPermissions(plan);
  }
  
  // Apply transaction concern
  let transaction;
  if (concerns.includes('transaction')) {
    transaction = await runtime.vsl.beginTransaction();
  }
  
  try {
    // Execute plan
    const result = await runtime.orchestrator.execute(plan);
    
    // Commit transaction
    if (transaction) {
      await runtime.vsl.commitTransaction(transaction);
    }
    
    // Apply performance concern
    if (concerns.includes('performance')) {
      await runtime.metrics.recordLatency(plan.plan_id, result.duration);
    }
    
    return result;
  } catch (error) {
    // Rollback transaction
    if (transaction) {
      await runtime.vsl.rollbackTransaction(transaction);
    }
    throw error;
  }
}
```

## 6. Cross-Layer Impact

### 6.1 Example: Security Concern

**L1 (Schema)**: Define `meta.cross_cutting: ["security"]`  
**L2 (Module)**: Plan Module defines approval workflow  
**L3 (Runtime)**: Enforce access control, audit logs  
**L4 (Integration)**: Verify webhook signatures

**Flow**:
```
L4: GitHub webhook arrives with signature L3: Verify HMAC signature (security concern) L2: Create Plan (requires approval if security enabled) L1: Validate Plan against schema (includes security metadata)
```

### 6.2 Example: Performance Concern

**L1**: Define `meta.cross_cutting: ["performance"]`  
**L2**: Plan Module defines step execution order  
**L3**: Track LLM token usage, latency per step  
**L4**: External tool execution time

**Metrics Collected**:
- Context load time
- Plan validation time
- Step execution latency
- LLM token count
- Tool invocation duration
- Total Plan completion time

## 7. Concern Interactions

Some concerns naturally interact:

### 7.1 Transaction + Error Handling
- **Transaction**: Provides rollback mechanism
- **Error Handling**: Triggers rollback on failures
- **Combined Effect**: Atomic execution with graceful failure recovery

### 7.2 Coordination + Orchestration
- **Coordination**: Manages agent-to-agent handoffs (MAP Profile)
- **Orchestration**: Manages step-to-step dependencies (SA Profile)
- **Combined Effect**: Complex multi-agent workflows with dependencies

### 7.3 Observability + Performance
- **Observability**: Emits structured events
- **Performance**: Includes latency/cost in event payload
- **Combined Effect**: Performance monitoring via event stream analysis

## 8. Compliance Requirements

### 8.1 REQUIRED Concerns (for v1.0 compliance)

**None**. Cross-cutting concerns are **OPTIONAL** for minimal compliance.

**Recommended for Production**:
- **Error Handling**: Production systems need graceful failure recovery
- **Observability**: Monitoring and debugging require events
- **Performance**: Cost control requires token tracking

### 8.2 Concern-Specific Requirements

IF a concern is enabled (via `meta.cross_cutting[]`), implementations MUST honor it:

| Concern | Requirement |
|:---|:---|
| `transaction` | MUST provide atomic PSG updates |
| `security` | MUST enforce access control checks |
| `performance` | MUST emit latency/cost metrics |
| `state-sync` | MUST maintain PSG consistency |
| `error-handling` | MUST provide retry/compensation logic |

## 9. Best Practices

### 9.1 Start Minimal

**For prototypes/testing**:
```json
{
  "meta": {
    "cross_cutting": []  // No concerns
  }
}
```

**For development**:
```json
{
  "meta": {
    "cross_cutting": ["observability", "error-handling"]
  }
}
```

**For production**:
```json
{
  "meta": {
    "cross_cutting": [
      "security",
      "transaction",
      "error-handling",
      "observability",
      "performance",
      "state-sync"
    ]
  }
}
```

### 9.2 Concern Composition

**Avoid over-engineering early prototypes**:
- Start with all 9 concerns enabled
- Start with 0-2 concerns, add as needed

**Scale incrementally**:
1. **Phase 1**: Observability (debugging)
2. **Phase 2**: + Error Handling (reliability)
3. **Phase 3**: + Performance (optimization)
4. **Phase 4**: + Security + Transaction (production hardening)

## 10. Document Index

| # | Concern | File | Size (bytes) | Priority |
|:-:|:---|:---|---:|:---|
| 1 | **AEL** | [ael.md](ael.md) | 3,586 | Core |
| 2 | **Coordination** | [coordination.md](coordination.md) | 3,040 | MAP only |
| 3 | **Error Handling** | [error-handling.md](error-handling.md) | 2,996 | High |
| 4 | **Event Bus** | [event-bus.md](event-bus.md) | 1,429 | Medium |
| 5 | **Learning Feedback** | [learning-feedback.md](learning-feedback.md) | 3,145 | Optional |
| 6 | **Observability** | [observability.md](observability.md) | 3,029 | High |
| 7 | **Orchestration** | [orchestration.md](orchestration.md) | 1,461 | Core |
| 8 | **Performance** | [performance.md](performance.md) | 1,635 | Medium |
| 9 | **Protocol Version** | [protocol-versioning.md](protocol-versioning.md) | 2,998 | High |
| 10 | **Protocol Versioning** | [protocol-versioning.md](protocol-versioning.md) | 1,436 | High |
| 11 | **Security** | [security.md](security.md) | 1,845 | High |
| 12 | **State Sync** | [state-sync.md](state-sync.md) | 1,826 | Medium |
| 13 | **Transaction** | [transaction.md](transaction.md) | 1,570 | High |
| 14 | **VSL** | [vsl.md](vsl.md) | 2,852 | Core |
| 15 | **Overview** | overview.md | - | Start here |

## 11. Related Documents

**Architecture**:
- [Architecture Overview](../architecture-overview.md)
- [L1 Core Protocol](../l1-core-protocol.md)
- [L3 Execution & Orchestration](../l3-execution-orchestration.md)

**Metadata**:
- `schemas/v2/common/metadata.schema.json` - 9 concern enum

**Module Docs**:
- `docs/02-modules/` - How modules use concerns

---

**Document Status**: Overview (Non-Normative)  
**Total Concerns**: 15 (9 in metadata enum + 6 documentation)  
**Opt-In Mechanism**: `meta.cross_cutting[]` array  
**Compliance**: All concerns OPTIONAL for v1.0, but MUST be honored if declared
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
