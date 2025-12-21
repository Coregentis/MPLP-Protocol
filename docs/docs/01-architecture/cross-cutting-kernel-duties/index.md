---
title: Cross-Cutting Kernel Duties (11 OS-Level Duties)
description: The 11 OS-Level Kernel Duties that apply across every lifecycle stage, agent, and runtime in MPLP.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, kernel duties, cross-cutting, OS-level, obligations]
sidebar_label: 11 Kernel Duties (Overview)
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Cross-Cutting Kernel Duties (11 OS-Level Duties)

> [!IMPORTANT]
> **SOT Definition**: These 11 kernel obligations apply across every lifecycle stage, agent, and runtime. They ensure multi-agent systems remain coherent, auditable, recoverable, and deterministic — the core requirements of an Agent OS.

## The 11 Duties

1.  [**Coordination**](./coordination.md) — Managing multi-agent collaboration and handoffs.
2.  [**Error Handling**](./error-handling.md) — Recovering from failures deterministically.
3.  [**Event Bus**](./event-bus.md) — Universal event emission and subscription.
4.  [**Learning Feedback**](./learning-feedback.md) — Closing the loop from outcome to improvement.
5.  [**Observability**](./observability.md) — Deep visibility into reasoning and state.
6.  [**Orchestration**](./orchestration.md) — Pipeline management and flow control.
7.  [**Performance**](./performance.md) — Latency, throughput, and resource limits.
8.  [**Protocol Versioning**](./protocol-versioning.md) — Handling schema evolution and compatibility.
9.  [**Security**](./security.md) — Authentication, authorization, and sandboxing.
10. [**State Sync**](./state-sync.md) — Keeping distributed state consistent (PSG).
11. [**Transaction**](./transaction.md) — Atomic operations and rollback requirements.

## Scope

These duties are **NOT** optional features. They are **kernel obligations**. A runtime cannot claim MPLP compliance if it ignores these duties, even if it fulfills the 10 modules correctly.
