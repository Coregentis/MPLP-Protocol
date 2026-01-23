---
sidebar_position: 6
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Normative definitions for key terms used throughout the MPLP v1.0 specification."
title: Glossary
---

This document provides normative definitions for key terms used throughout the Multi-Agent Lifecycle Protocol (MPLP) v1.0 specification. All definitions are based on actual schemas and implementations in the codebase.

## Core Modules (L2)

### Context
**Category:** L2 Module  
**Definition (Mirror):** The foundational module that defines project scope, environment, and root configuration. Provides `context_id`, `root` domain, and `governance` metadata.  
**Truth Source:** `schemas/v2/mplp-context.schema.json`  
**Key Fields:** `context_id`, `root.domain`, `root.environment`, `status` (enum: draft, active, suspended, archived, closed)

### Plan
**Category:** L2 Module  
**Definition (Mirror):** Structures executable work as a directed acyclic graph (DAG) of steps with dependencies. Each step specifies an `agent_role`, `status`, and optional dependencies.  
**Truth Source:** `schemas/v2/mplp-plan.schema.json`  
**Key Fields:** `plan_id`, `context_id`, `steps[]`, `status` (enum: draft, proposed, approved, in_progress, cancelled, completed)

### Confirm
**Category:** L2 Module  
**Definition (Mirror):** Manages human-in-the-loop approval workflows. Captures approval/rejection decisions with timestamps and decision-maker roles.  
**Truth Source:** `schemas/v2/mplp-confirm.schema.json`  
**Key Fields:** `confirm_id`, `target_id`, `target_type`, `status` (enum: pending, approved, rejected, cancelled)

### Trace
**Category:** L2 Module  
**Definition (Mirror):** Records immutable execution history using OpenTelemetry-compatible spans and segments. Links execution to plans and contexts.  
**Truth Source:** `schemas/v2/mplp-trace.schema.json`  
**Key Fields:** `trace_id`, `context_id`, `plan_id`, `root_span`, `segments[]`, `status`

### Role
**Category:** L2 Module  
**Definition (Mirror):** Defines agent capabilities and permissions through capability strings (e.g., `plan.create`, `confirm.approve`). Enables role-based access control.  
**Truth Source:** `schemas/v2/mplp-role.schema.json`  
**Key Fields:** `role_id`, `name`, `capabilities[]`, `description`

### Dialog
**Category:** L2 Module  
**Definition (Mirror):** Manages multi-turn conversation threads. Uses minimal protocol format aligned with major LLM providers (OpenAI/Anthropic).  
**Truth Source:** `schemas/v2/mplp-dialog.schema.json`  
**Key Fields:** `dialog_id`, `context_id`, `thread_id`, `messages[]`, `status` (enum: active, paused, completed, cancelled)

### Collab
**Category:** L2 Module  
**Definition (Mirror):** Orchestrates multi-agent sessions with coordination modes. Manages participant rosters and turn-taking semantics.  
**Truth Source:** `schemas/v2/mplp-collab.schema.json`  
**Key Fields:** `collab_id`, `mode` (enum: broadcast, round_robin, orchestrated, swarm, pair), `participants[]`, `status`

### Extension
**Category:** L2 Module  
**Definition (Mirror):** Provides plugin mechanism for external tools and capabilities. Supports capability injection with versioned configurations.  
**Truth Source:** `schemas/v2/mplp-extension.schema.json`  
**Key Fields:** `extension_id`, `extension_type` (enum: capability, policy, integration, transformation, validation), `version` (SemVer), `status`

### Core
**Category:** L2 Module  
**Definition (Mirror):** Central governance module that maintains the module registry and protocol version. Tracks which modules are enabled in the runtime.  
**Truth Source:** `schemas/v2/mplp-core.schema.json`  
**Key Fields:** `core_id`, `protocol_version`, `modules[]` (descriptors with module_id, version, status), `status`

### Network
**Category:** L2 Module  
**Definition (Mirror):** Manages distributed agent topology and node status. Maps roles to physical/virtual execution units.  
**Truth Source:** `schemas/v2/mplp-network.schema.json`  
**Key Fields:** `network_id`, `topology_type` (enum: single_node, hub_spoke, mesh, hierarchical), `nodes[]`, `status`

## Event Families (Observability)

Based on `schemas/v2/events/mplp-event-core.schema.json`, MPLP defines 12 normative event families:

### pipeline_stage
**Required:** YES  
**Definition:** Lifecycle transitions of Plans and Steps (e.g., `draft` -> `approved` -> `in_progress` -> `completed`).  
**Truth Source:** `schemas/v2/events/mplp-pipeline-stage-event.schema.json`

### graph_update
**Required:** YES  
**Definition:** Structural changes to the Project Semantic Graph (PSG) such as node/edge additions or removals.  
**Truth Source:** `schemas/v2/events/mplp-graph-update-event.schema.json`

### import_process
**Definition:** Project initialization and onboarding events.

### intent
**Definition:** User's original request or goal.

### delta_intent
**Definition:** Modification or refinement of an existing intent.

### methodology
**Definition:** High-level approach or strategy selection.

### reasoning_graph
**Definition:** Chain-of-thought internal reasoning traces.

### runtime_execution
**Definition:** Low-level execution details (LLM API calls, tool invocations).  
**Truth Source:** `schemas/v2/events/mplp-runtime-execution-event.schema.json`

### impact_analysis
**Definition:** Predicted side-effects and risks of a proposed change.

### compensation_plan
**Definition:** Rollback or undo strategies for failed actions.

### cost_budget
**Definition:** Token usage, API costs, and resource consumption metrics.

### external_integration

### MAP Profile (Multi-Agent Profile)
**Category:** Execution Profile  
**Status:** RECOMMENDED for v1.0  
**Definition (Mirror):** Extends SA  with multi-agent coordination via Collab, Dialog, and Network modules. Defined by `schemas/v2/invariants/map-invariants.yaml`.  
**Key Invariants:**
- `map_session_requires_multiple_participants`:  participants
- `map_collab_mode_valid`: Mode must be valid enum
- `map_participants_have_role_ids`: All participants must have role bindings

## Runtime Concepts (L3)

### Project Semantic Graph (PSG)
**Category:** L3 Runtime  
**Definition (Mirror):** The logical graph model maintained by the runtime, where nodes are protocol objects (Context, Plan, etc.) and edges represent relationships (dependencies, ownership, traceability). Serves as the single source of truth for project state.

### Drift Detection
**Category:** L3 Runtime  
**Definition (Mirror):** Process of identifying discrepancies between the PSG state and actual file system/repository state. Includes passive (event-driven) and active (polling) detection strategies.

### Action Execution Layer (AEL)
**Category:** L3 Runtime  
**Definition (Behavioral):** Runtime component responsible for executing actions defined in plans (e.g., LLM API calls, tool invocations). Implementation-specific but must emit conformant events.

### Value State Layer (VSL)
**Category:** L3 Runtime  
**Definition (Behavioral):** Abstraction for state persistence (e.g., Redis, Postgres, in-memory). Provides `get(key)` and `set(key, value)` interface.

## Integration (L4)

### File Update Event
**Truth Source:** `schemas/v2/integration/mplp-file-update-event.schema.json`  
**Definition:** IDE file system changes (created, modified, deleted, renamed).

### Git Event
**Truth Source:** `schemas/v2/integration/mplp-git-event.schema.json`  
**Definition:** Version control operations (commit, push, merge, tag).

### CI Event
**Truth Source:** `schemas/v2/integration/mplp-ci-event.schema.json`  
**Definition:** Continuous integration pipeline status changes.

### Tool Event
**Truth Source:** `schemas/v2/integration/mplp-tool-event.schema.json`  
**Definition:** External tool invocations (formatters, linters, test runners).

## Learning

### Learning Sample
**Category:** Learning Module  
**Definition (Mirror):** Structured record of agent experience capturing input, output, and feedback. Used for fine-tuning and reinforcement learning.  
**Schemas:**
- `schemas/v2/common/learning-sample.schema.json` (core structure)
- `schemas/v2/learning/mplp-learning-sample-intent.schema.json` (intent resolution)
- `schemas/v2/learning/mplp-learning-sample-delta.schema.json` (delta impact)

**Key Fields:** `sample_id`, `project_id`, `intent_before`, `plan`, `success_flag`, `user_feedback.decision` (enum: approve, reject, override), `timestamps`

## Cross-Cutting Concerns

### Governance
**Definition (Mirror):** Metadata structure present in all protocol objects, defining `lifecyclePhase`, `truthDomain`, `locked` status, and `lastConfirmRef`.

### Invariant
**Definition (Mirror):** Validation rule encoded in YAML (e.g., `sa-invariants.yaml`, `map-invariants.yaml`) that enforces protocol constraints. Includes `id`, `scope`, `path`, `rule`, and `description`.

### Metadata Block
**Truth Source:** `schemas/v2/common/metadata.schema.json`  
**Definition (Mirror):** Standard `meta` field in all protocol objects containing `protocolVersion`, `frozen` (boolean), `freezeDate`, and `governance` authority.

### UUID v4
**Truth Source:** `schemas/v2/common/identifiers.schema.json`  
**Definition (Mirror):** Standard identifier format for all protocol entities. Must conform to RFC 4122 UUID version 4.

### ISO 8601
**Definition (Mirror):** Standard timestamp format for all temporal fields (e.g., `created_at`, `timestamp`). Must include timezone information (UTC recommended).

### Immutable (MPLP)
**Definition (Normative):** In MPLP documentation, "immutable" refers to **append-only, tamper-evident record semantics (WORM)** at the protocol and storage abstraction level. It does **not** imply blockchain, distributed ledger technology, or cryptographic immutability. This term is used strictly in a technical context.