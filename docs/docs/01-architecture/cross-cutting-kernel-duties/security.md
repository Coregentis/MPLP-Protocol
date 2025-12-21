---
title: Security
description: Kernel duty for authentication, authorization, and sandboxing.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Security, authentication, authorization, sandboxing, RBAC]
sidebar_label: Security
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Security

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To protect the system from malicious or malfunctioning agents by enforcing strict identity, access control, and execution boundaries.

## Lifecycle Coverage
*   **All Stages**: From Agent Login to Tool Execution.

## Agent Scope (SA / MAP)
*   **SA**: Tool permission scopes (e.g., read-only filesystem).
*   **MAP**: Identity verification and role-based access control (RBAC).

## Required Events
*   `AccessGranted`
*   `AccessDenied`
*   `SecurityAlert`

## Compliance Requirements
1.  Runtime MUST verify the identity of all agents and users.
2.  Runtime MUST enforce Role-Based Access Control (RBAC) on PSG nodes.
3.  Runtime SHOULD sandbox code execution environments.

## Implementation Details (Non-Normative)

Security in MPLP is enforced through **Role-Based Access Control (RBAC)** and **Human-in-the-Loop (HITL)** confirmation flows.

### Role-Based Access Control
The `Role` object (`mplp-role.schema.json`) is the cornerstone of authorization:
- **`capabilities`**: A list of permission strings (e.g., `plan.write`, `tool.exec.filesystem`) assigned to a role.
- **`role_id`**: Every agent and user is bound to a role, which dictates their access to the PSG.

### Human-in-the-Loop Confirmation
For high-stakes actions, the `Confirm` object (`mplp-confirm.schema.json`) enforces a security gate:
- **`status`**: The action remains `pending` until explicitly `approved`.
- **`decisions`**: An auditable record of who approved the action and when.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-role.schema.json` | Defines permissions | `role_id`, `capabilities` |
| `mplp-confirm.schema.json` | Defines security gates | `confirm_id`, `status`, `decisions` |

## Examples
*   **Sandboxing**: Running generated Python code in a Docker container with no network access.
*   **RBAC**: Preventing a "Viewer" agent from modifying the "Plan".

