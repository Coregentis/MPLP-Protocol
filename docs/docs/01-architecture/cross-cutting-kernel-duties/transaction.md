---
title: Transaction
description: Kernel duty for atomic operations and rollback guarantees.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Transaction, atomic operations, rollback, data integrity]
sidebar_label: Transaction
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Transaction

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To ensure data integrity by grouping related operations into atomic units that either succeed completely or fail without side effects.

## Lifecycle Coverage
*   **Execution**: Critical state updates (e.g., Handoffs, Plan Confirmation).

## Agent Scope (SA / MAP)
*   **All**: Ensuring PSG consistency during complex updates.

## Required Events
*   `TransactionStarted`
*   `TransactionCommitted`
*   `TransactionRolledBack`

## Compliance Requirements
1.  Runtime MUST support atomic updates for critical PSG operations (e.g., Handoff).
2.  Runtime MUST support rollback to a previous consistent state in case of failure.
3.  Runtime SHOULD implement optimistic or pessimistic locking for concurrency.

## Implementation Details (Non-Normative)

While MPLP is storage-agnostic, it defines logical transaction boundaries via the **Confirm Module** and **Plan Lifecycle**.

### Logical Transactions
The `Confirm` object (`mplp-confirm.schema.json`) acts as a distributed transaction record for business-critical decisions:
- It groups a request (`target_id`), a decision (`status`), and an audit trail (`trace`) into a single atomic unit.
- The system must not proceed with the target action until the `Confirm` transaction is `approved`.

### State Consistency
Major lifecycle transitions (e.g., moving a Plan from `draft` to `active`) are treated as atomic state changes. The Runtime ensures that all related resources (Steps, Context status) are updated consistently or rolled back.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-confirm.schema.json` | Logical transaction record | `confirm_id`, `target_id`, `status` |

## Examples
*   **Atomic Handoff**: Updating `current_agent` and `turn_id` in a single operation; if one fails, both revert.
*   **Plan Confirmation**: Freezing the Plan and generating the first Step in one transaction.

