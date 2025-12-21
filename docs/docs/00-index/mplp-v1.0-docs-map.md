---
title: Documentation Map
description: Navigate MPLP v1.0 documentation by role. Find reading paths for runtime implementers, system architects, SDK users, test engineers, and compliance reviewers.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, MPLP documentation, docs navigation, reading guide, implementation guide, compliance documentation, SDK documentation]
sidebar_label: Documentation Map
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# MPLP v1.0 Documentation Map

Welcome to the Multi-Agent Lifecycle Protocol (MPLP) v1.0 documentation. This guide helps you navigate to the right documents based on your role and objectives.

## Quick Start by Role

###  For First-Time Users
**Goal**: Understand what MPLP is and how it helps

**Reading Path** (30 min total):
1. [Protocol Overview](mplp-v1.0-protocol-overview.md) - High-level architecture (15 min)
2. [Glossary](glossary.md) - Key terms and definitions (10 min)
3. [API Quick Reference](api-quick-reference.md) - Rapid navigation (5 min)

### For Runtime Implementers
**Goal**: Build an MPLP-compliant runtime

**Essential Documents**:
1. **Compliance Requirements**:
   - [Conformance Guide](../08-guides/conformance-guide.md) - 3 conformance levels
   - [Conformance Checklist](../08-guides/conformance-checklist.md) - Self-assessment

2. **Core Specifications**:
   - [SA Profile](../03-profiles/sa-profile.md) - **REQUIRED**: 9 invariants
   - [MAP Profile](../03-profiles/map-profile.md) - **RECOMMENDED**: Multi-agent rules
   - [Multi-Agent Governance](../03-profiles/multi-agent-governance-profile.md) - Governance rules

3. **Module Implementations** (10 modules):
   - [Context Module](../02-modules/context-module.md)
   - [Plan Module](../02-modules/plan-module.md)
   - [Confirm Module](../02-modules/confirm-module.md)
   - [Trace Module](../02-modules/trace-module.md)
   - [Role Module](../02-modules/role-module.md)
   - [Dialog Module](../02-modules/dialog-module.md)
   - [Collab Module](../02-modules/collab-module.md)
   - [Extension Module](../02-modules/extension-module.md)
   - [Core Module](../02-modules/core-module.md)
   - [Network Module](../02-modules/network-module.md)

4. **Observability** (**REQUIRED** for compliance):
   - [Observability Overview](../04-observability/observability-overview.md) - 3+12 architecture
   - [Event Taxonomy](../04-observability/event-taxonomy.md) - 12 event families
   - [Physical Schemas Reference](../04-observability/physical-schemas-reference.md) - 3 event schemas
   - [Module Event Matrix](../04-observability/module-event-matrix.md) - Emission requirements
   - [Runtime Trace Format](../04-observability/runtime-trace-format.md) - W3C compatible

5. **Runtime Integration**:
   - [Runtime Glue Overview](../06-runtime/runtime-glue-overview.md) - PSG, VSL, AEL
   - [PSG Binding](../06-runtime/crosscut-psg-event-binding.md) - Graph structure
   - [Drift Detection](../06-runtime/drift-and-rollback.md) - State validation
   - [Rollback Mechanisms](../06-runtime/drift-and-rollback.md) - Compensation

### For System Architects
**Goal**: Design MPLP-based multi-agent systems

**Reading Path**:
1. **Architecture Layers**:
   - [Architecture Overview](../01-architecture/architecture-overview.md)
   - [L1: Core Protocol](../01-architecture/l1-core-protocol.md) - Schemas & invariants
   - [L2: Coordination & Governance](../01-architecture/l2-coordination-governance.md) - Modules
   - [L3: Execution & Orchestration](../01-architecture/l3-execution-orchestration.md) - Runtime
   - [L4: Integration](../01-architecture/l4-integration-infra.md) - External systems

2. **Cross-Cutting Concerns**:
   - [Observability](../04-observability/observability-overview.md)
   - [Security](../01-architecture/cross-cutting-kernel-duties/security.md)
   - [State Sync](../01-architecture/cross-cutting-kernel-duties/state-sync.md)
   - [Transaction](../01-architecture/cross-cutting-kernel-duties/transaction.md)
   - [Event Bus](../01-architecture/cross-cutting-kernel-duties/event-bus.md)
   - [Orchestration](../01-architecture/cross-cutting-kernel-duties/orchestration.md)

3. **Coordination Patterns**:
   - [Module Interactions](../02-modules/module-interactions.md)
   - [MAP Profile](../03-profiles/map-profile.md) - 5 coordination modes

###  For IDE / Tool Integrators
**Goal**: Connect IDE, CI/CD, or Git to MPLP runtime

**Reading Path**:
1. [Integration Overview](../07-integration/integration-spec.md) - L4 layer concepts
2. [Minimal Integration Spec](../07-integration/integration-spec.md) - 4 event types:
   - File Update Events (IDE)
   - Git Events (version control)
   - CI Events (pipelines)
   - Tool Events (linters, formatters)
3. [Tools and Runtimes](../07-integration/integration-spec.md) - Best practices

###  For SDK Users
**Goal**: Use MPLP SDKs in applications

**SDK Guides**:
- [TypeScript SDK Guide](../10-sdk/ts-sdk-guide.md) - `@mplp/sdk-ts` v1.0.3
- [Python SDK Guide](../10-sdk/py-sdk-guide.md) - `@mplp/sdk-py` v1.0.3

**SDK Reference**:
- [SDK Support Matrix](../10-sdk/implementation-maturity-matrix.md) - Language coverage

###  For Test Engineers
**Goal**: Validate MPLP compliance

**Testing Resources**:
- [Golden Flows Overview](../09-tests/golden-test-suite-overview.md) - 9 canonical flows in `tests/golden/flows/`:
  - FLOW-01 to FLOW-05: Single-agent scenarios
  - SA-01, SA-02: SA Profile tests
  - MAP-01, MAP-02: Multi-agent coordination
- [Flow Registry](../09-tests/golden-flow-registry.md) - Complete test catalog
- [Fixture Format](../09-tests/golden-fixture-format.md) - Test data structure

###  For AI/ML Researchers
**Goal**: Study learning and improvement mechanisms

**Learning Resources**:
- [Learning Overview](../05-learning/learning-overview.md) - Learning loop
- [Learning Sample Schema](../05-learning/learning-sample-schema.md) - Data structure for RLHF/SFT
- Schemas: `schemas/v2/learning/`:
  - `mplp-learning-sample-core.schema.json`
  - `mplp-learning-sample-intent.schema.json`
  - `mplp-learning-sample-delta.schema.json`

###  For Compliance / Legal Reviewers
**Goal**: Audit protocol for licensing, IP, governance

**Reading Path**:
1. [Protocol Overview](mplp-v1.0-protocol-overview.md) - Scope & boundaries
2. [Conformance Guide](../08-guides/conformance-guide.md) - Requirements
3. [Conformance Checklist](../08-guides/conformance-checklist.md) - Self-assessment
4. [Versioning Policy](../12-governance/versioning-policy.md) - Compatibility rules
5. [MIP Process](../12-governance/mip-process.md) - Governance workflow
6. `LICENSE.txt` (Apache-2.0 at repository root)

---

## Documentation Directory Structure

```
docs/
 00-index/            # Navigation & overview    mplp-v1.0-protocol-overview.md    glossary.md    api-quick-reference.md    mplp-v1.0-docs-map.md (this file)    mplp-v1.0-docs-manifest.yaml 
 01-architecture/     # 4-layer architecture (L1-L4)    architecture-overview.md    l1-core-protocol.md    l2-coordination-governance.md    l3-execution-orchestration.md    l4-integration-infra.md    schema-conventions.md    cross-cutting-kernel-duties/   # 11 cross-cutting kernel duties 
 02-modules/          # 10 L2 modules    context-module.md    plan-module.md    confirm-module.md    trace-module.md    role-module.md    dialog-module.md    collab-module.md    extension-module.md    core-module.md    network-module.md    module-interactions.md 
 03-profiles/         # Execution profiles    sa-profile.md    sa-profile.yaml    sa-events.md    map-profile.md    map-profile.yaml    map-events.md    multi-agent-governance-profile.md    diagrams/ 
 04-observability/    # 12 event families    observability-overview.md    event-taxonomy.md    physical-schemas-reference.md    module-event-matrix.md    module-event-matrix.yaml    event-taxonomy.yaml    runtime-trace-format.md 
 05-learning/         # Learning & improvement    learning-overview.md    learning-sample-schema.md 
 06-runtime/          # L3 runtime specs    runtime-glue-overview.md    crosscut-psg-event-binding.md    drift-and-rollback.md 
 07-integration/      # L4 integration (optional)    integration-spec.md 
 08-guides/           # Compliance & tutorials    mplp-v1.0-compliance-guide.md    mplp-v1.0-compliance-checklist.md    migration-guide.md 
 09-tests/            # Golden flows    golden-test-suite-overview.md    golden-flow-registry.md    golden-fixture-format.md 
 10-sdk/              # SDK documentation    ts-sdk-guide.md    py-sdk-guide.md    sdk-support-matrix.md 
 11-examples/         # Usage examples 
 12-governance/       # Governance & policy    versioning-policy.md    mip-process.md    security-policy.md 
 13-release/          # Release notes    mplp-v1.0.0-release-notes.md 
 14-ops/              # Operations & maintenance
     mplp-ops-overview.md
     release-runbook.md
     schema-sdk-change-process.md
```

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
- `invariants/sa-invariants.yaml` (8 SA rules)
- `invariants/map-invariants.yaml` (7 MAP rules)
- `invariants/observability-invariants.yaml`
- `invariants/integration-invariants.yaml`
- `invariants/learning-invariants.yaml`

---

## Version & Governance

- **Protocol Version**: 1.0.0 (Frozen as of 2025-12-03)
- **Governance**: MPLP Protocol Governance Committee (MPGC)
- **License**: Apache-2.0
- **Repository**: [https://github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)

**For governance inquiries**, see [12-governance/mip-process.md](../12-governance/mip-process.md).
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
