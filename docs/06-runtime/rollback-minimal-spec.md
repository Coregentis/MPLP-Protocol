---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Rollback Minimal Specification (MPLP v1.0)

> This document defines the **Rollback** mechanism for the L3 Runtime.

---

## 1. Overview

Rollback allows the Runtime to revert the PSG to a previous consistent state. This is essential for **Error Recovery** and **Transaction** crosscuts.

## 2. Snapshot Mechanism

To support rollback, the Runtime MUST maintain **Snapshots** of the PSG.

-   **Granularity**: At minimum, snapshots should be taken at **Pipeline Stage** boundaries.
-   **Storage**: Snapshots can be stored as full copies or delta logs.

## 3. Rollback Trigger

Rollback is typically triggered by:
1.  **Critical Failure**: Unrecoverable error in `RuntimeExecutionEvent`.
2.  **User Request**: Explicit `IntentEvent` to undo.
3.  **Transaction Abort**: Failure in a multi-step atomic operation.

## 4. Consistency Requirements

When performing a rollback:
1.  **Trace Integrity**: The Trace MUST NOT be deleted. The rollback itself is an event (`RollbackPerformed`) appended to the Trace.
2.  **PSG Reversion**: The PSG `project_root`, `plans`, and `context` nodes are reverted to the snapshot state.
3.  **Event Compensation**: If external side-effects occurred (e.g., API calls), the Runtime SHOULD attempt compensation (best-effort).

## 5. Trace Artifacts

A Rollback operation produces:
-   `RollbackInitiated` event.
-   `RollbackCompleted` event.
-   A new **Trace Span** representing the re-execution path.
