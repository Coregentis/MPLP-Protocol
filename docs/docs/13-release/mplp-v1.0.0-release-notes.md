---
title: v1.0.0 Release Notes
description: Official Release Notes for MPLP v1.0.0. Highlights key features, protocol layers, event architecture, package structure, and installation instructions.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Release Notes, MPLP v1.0.0, protocol release, key features, event architecture, installation, frozen status]
sidebar_label: v1.0.0 Release Notes
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# MPLP v1.0.0 Release Notes

**Release Date**: 2025-12-03
**Status**: FROZEN

## 1. Introduction

We are proud to announce the official release of **MPLP (Multi-Agent Lifecycle Protocol) v1.0.0** a vendor-neutral, protocol-first specification for building observable, interoperable AI agent systems.

## 2. Key Features

### 2.1 Protocol Layers

| Layer | Description |
|:---|:---|
| **L1 Core** | Context, Plan, Confirm, Trace schemas |
| **L2 Coordination** | Role, Dialog, Collab, Network modules |
| **L3 Execution** | Extension, Learning modules |

### 2.2 Event Architecture

- **3 Physical Event Schemas**: `PipelineStageEvent`, `GraphUpdateEvent`, `RuntimeExecutionEvent`
- **12 Logical Event Families**: Job, Step, Plan, etc.

### 2.3 Profiles

| Profile | Use Case |
|:---|:---|
| **SA (Single Agent)** | Solo agent execution |
| **MAP (Multi-Agent)** | Collaborative agent workflows |

## 3. Package Structure

| Component | Path | Purpose |
|:---|:---|:---|
| **Schemas** | `schemas/v2/` | JSON Schema definitions |
| **SDK (TypeScript)** | `packages/sdk-ts/` | Reference implementation |
| **SDK (Python)** | `packages/sdk-py/` | Cross-language support |
| **Golden Tests** | `tests/golden/` | Compliance test fixtures |
| **Documentation** | `docs/` | Protocol specification |

## 4. Installation

### TypeScript

```bash
npm install @mplp/sdk-ts
```

### Python

```bash
pip install mplp
```

## 5. Breaking Changes

This is the initial stable release. No breaking changes from v0.9.

## 6. Known Issues

See [Known Issues v1.0.0](./mplp-v1.0.0-known-issues.md)

## 7. Acknowledgments

Thanks to the Coregentis Team and the Open Source Community for their contributions.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
