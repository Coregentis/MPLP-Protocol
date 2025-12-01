---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Migration Guide: v0.9 → v1.0

**Date**: 2025-12-01
**Audience**: Developers migrating from MPLP v0.9 (Draft) to v1.0 (Stable).

## 1. Overview

MPLP v1.0 introduces significant architectural improvements to ensure long-term stability. This guide covers the breaking changes and necessary migration steps.

## 2. Breaking Changes

### 2.1. Schema Location & Structure
- **Old**: `schemas/v1/*.json` (flat structure)
- **New**: `schemas/v2/<module>/mplp-<module>.schema.json` (modular structure)
- **Action**: Update all schema references in your code and CI pipelines to point to `schemas/v2/`.

### 2.2. Event Model ("3 Physical / 12 Logical")
- **Old**: Distinct physical schemas for every event type (e.g., `JobStartedEvent`, `StepCompletedEvent`).
- **New**: 3 Physical Schemas (`PipelineStageEvent`, `GraphUpdateEvent`, `RuntimeExecutionEvent`) carrying 12 Logical Families.
- **Action**: Update event consumers to switch on `family` and `event_type` fields within the physical payload.

### 2.3. Protocol Invariants
- **New**: 50+ normative invariants are now strictly enforced (e.g., `sa_context_must_be_active`).
- **Action**: Ensure your implementation validates these invariants using the Golden Test Suite.

## 3. Migration Steps

### Step 1: Update SDKs
Upgrade to the v1.0.0 release of the official SDKs:
```bash
# TypeScript
pnpm add @mplp/sdk-ts@1.0.0

# Python
pip install mplp-sdk==1.0.0
```

### Step 2: Validate Data
Run your existing `Context`, `Plan`, and `Trace` JSON files against the v2 Schemas:
```bash
mplp validate --schema-version v2 ./my-data/
```

### Step 3: Run Golden Tests
Verify your runtime compliance by running the Golden Test Suite:
```bash
mplp test golden --flow FLOW-01
```

## 4. Deprecations

- **v0.9 Schemas**: Deprecated immediately. Will be removed in v1.1.
- **Legacy Event Types**: All v0.9 event types are obsolete.
