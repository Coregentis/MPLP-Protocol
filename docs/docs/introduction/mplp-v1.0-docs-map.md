---
sidebar_position: 4
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Quick reference map for all MPLP schemas, modules, events, and invariants with their file locations."
title: Documentation Map
---

## Schema Quick Reference

All schemas located in `schemas/v2/`:

### Core Modules
- `mplp-context.schema.json`
- `mplp-plan.schema.json`
- `mplp-confirm.schema.json`
- `mplp-trace.schema.json`
- `mplp-role.schema.json`
- `mplp-dialog.schema.json`
- `mplp-collab.schema.json`
- `mplp-extension.schema.json`
- `mplp-core.schema.json`
- `mplp-network.schema.json`

### Events
- `events/mplp-event-core.schema.json` (base + 12 families)
- `events/mplp-pipeline-stage-event.schema.json` (REQUIRED)
- `events/mplp-graph-update-event.schema.json` (REQUIRED)
- `events/mplp-runtime-execution-event.schema.json`
- `events/mplp-sa-event.schema.json`
- `events/mplp-map-event.schema.json`

### Integration (L4)
- `integration/mplp-file-update-event.schema.json`
- `integration/mplp-git-event.schema.json`
- `integration/mplp-ci-event.schema.json`
- `integration/mplp-tool-event.schema.json`

### Common
- `common/identifiers.schema.json` (UUID v4)
- `common/metadata.schema.json` (protocol version, freeze status)
- `common/trace-base.schema.json` (W3C trace context)
- `common/common-types.schema.json`
- `common/learning-sample.schema.json`

### Invariants
- `invariants/sa-invariants.yaml` (9 SA rules)
- `invariants/map-invariants.yaml` (9 MAP rules)
- `invariants/observability-invariants.yaml`
- `invariants/integration-invariants.yaml`
- `invariants/learning-invariants.yaml`

---

## Version & Governance

- **Protocol Version**: 1.0.0 (Frozen as of 2025-12-03)
- **Governance**: MPLP Protocol Governance Committee (MPGC)
- **License**: Apache-2.0
- **Repository**: [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)

**For governance inquiries**, see [12-governance/protocol-governance.md](/docs/evaluation/governance/protocol-governance.md).