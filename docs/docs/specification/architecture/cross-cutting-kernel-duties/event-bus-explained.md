---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-EBUS-INFO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: "Event Bus — Conceptual Overview"
sidebar_label: "Event Bus Explained"
sidebar_position: 6
description: "MPLP architecture documentation: Event Bus — Conceptual Overview. Defines structural requirements and layer responsibilities."
authority: protocol
---


# Event Bus — Conceptual Overview

> **Audience**: Implementers, Architects, Runtime Authors
> **Governance Rule**: DGP-30

## 1. What Event Bus Refers To

**Event Bus** in MPLP refers to the **observability and coordination dimension** that concerns event routing across protocol layers. It is the conceptual area where lifecycle events, observability data, and integration signals intersect.

Event Bus is **not a specific technology** (like Kafka or RabbitMQ). It is an **abstraction boundary** that implementations address with technology-specific solutions.

## 2. Conceptual Areas Covered by Event Bus

Event Bus **concerns** the following areas:

| Conceptual Area | Description |
|:---|:---|
| **Event Routing** | Relates to delivering observability events to interested parties |
| **12 Event Families** | Concerns the structured event taxonomy |
| **Required Events** | Relates to `pipeline_stage` and `graph_update` semantics |
| **L4 Integration** | Is involved in ingesting file, git, CI, and tool events |
| **Event Ordering** | Concerns causality preservation across event streams |

## 3. What Event Bus Does NOT Do

Event Bus explicitly **does not**:

- ❌ Define specific messaging protocols (AMQP, MQTT, etc.)
- ❌ Mandate persistent vs. ephemeral delivery
- ❌ Prescribe exactly-once vs. at-least-once semantics
- ❌ Define event retention policies
- ❌ Constitute a message queue implementation

## 4. Where Normative Semantics Are Defined

The normative semantics related to Event Bus are **NOT defined on this page**.

They are distributed across:

| Normative Source | What It Covers |
|:---|:---|
| **Event Core Schema** (`mplp-event-core.schema.json`) | Base event structure, 12 families |
| **Pipeline Stage Event Schema** | Lifecycle transition event structure |
| **Graph Update Event Schema** | PSG change notification structure |
| **Observability Invariants** | 12 rules for event structure |
| **L3 Execution & Orchestration** | Event emission semantics |

## 5. The 12 Event Families (Reference)

| Event Family | Required | Conceptual Purpose |
|:---|:---|:---|
| `pipeline_stage` | **YES** | Relates to Plan/Step lifecycle transitions |
| `graph_update` | **YES** | Concerns PSG structural changes |
| `import_process` | No | Relates to project initialization |
| `intent` | No | Concerns user request capture |
| `delta_intent` | No | Relates to intent modifications |
| `methodology` | No | Concerns approach selection |
| `reasoning_graph` | No | Relates to chain-of-thought traces |
| `runtime_execution` | No | Concerns LLM/tool execution details |
| `impact_analysis` | No | Relates to change impact predictions |
| `compensation_plan` | No | Concerns rollback strategies |
| `cost_budget` | No | Relates to token/cost tracking |
| `external_integration` | No | Concerns L4 system events |

## 6. Conceptual Relationships

Event Bus **interacts with** the following protocol elements:

<MermaidDiagram id="88f38ec5e2bf4512" />

## 7. Reading Path

To understand Event Bus-related normative semantics, read:

1. **[Observability Overview](../../observability/observability-overview.md)** — Event taxonomy
2. **[Event Taxonomy](../../observability/event-taxonomy.md)** — Detailed event definitions
3. **[L3 Execution & Orchestration](../l3-execution-orchestration.md)** — Runtime behavior
4. **[L4 Integration Infrastructure](../l4-integration-infra.md)** — Integration event routing

---

**Governance Rule**: DGP-30
**See Also**: [Event Bus Anchor](event-bus.md) (Normative)
