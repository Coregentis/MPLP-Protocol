---

# Multi-Agent Collaboration Flow

**Related Golden Flows**: `MAP-01`, `MAP-02`

> **Status**: 📅 Planned for Phase P7/P8

This document outlines the future Multi-Agent Collaboration example.

## Goal

To demonstrate how multiple Agents (e.g., a Planner and an Executor) collaborate to solve a complex task using the MPLP `Collab` and `Dialog` modules.

## Planned Architecture

-   **Flow Contract**: `MultiAgentCollabFlow` (to be finalized in `@mplp/coordination`).
-   **Modules**:
    -   `Role`: Defines agent capabilities and permissions.
    -   `Dialog`: Manages message exchange between agents.
    -   `Collab`: Orchestrates the joint planning and execution.
-   **Golden Suite**: This flow will be part of the Golden Test Suite to ensure interoperability.

## Current State

A skeleton project exists at `examples/ts-multi-agent-collab` as a placeholder. Implementation will begin after the SDKs are available.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
