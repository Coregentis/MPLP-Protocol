> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
## Quick Start

**New to MPLP?** Start here:
1. Read [Protocol Overview](mplp-v1.0-protocol-overview.md) (20 min)
2. **Try [5-Min Quickstart](../08-guides/mplp-quickstart-5min.md)** (Hands-on)
3. Review [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md) (30 min)
4. Try [Golden Test Suite](../09-tests/golden-test-suite-overview.md) (15 min)

**Implementing MPLP?** Key documents:
- [Compliance Checklist](../08-guides/mplp-v1.0-compliance-checklist.md)
- [SA Profile](../03-profiles/mplp-sa-profile.md)
- [Observability Overview](../04-observability/mplp-observability-overview.md)
- [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)

---

## Documentation Structure (Directory Tree)

```
docs/
├── 00-index/
│   ├── api-quick-reference.md
│   ├── glossary.md
│   ├── mplp-v1.0-docs-manifest.yaml
│   ├── mplp-v1.0-docs-map.md
│   └── mplp-v1.0-protocol-overview.md

---

### For IDE / Tool Integrators

**Goal**: Integrate IDE, CI, Git, or external tools with MPLP runtime

**Reading Path**:
1. ✅ [Integration Spec](../07-integration/mplp-minimal-integration-spec.md)
2. ✅ [Integration Taxonomy](../07-integration/integration-event-taxonomy.yaml) - 4 event families
3. ✅ [SDK Guides](../10-sdk/ts-sdk-guide.md) - Using the SDKs
4. ✅ [LLM Integration Example](../11-examples/vendor-neutral-llm-integration.md) - Vendor-neutral integration

---

### For Multi-Agent Researchers / Architects

**Goal**: Understand MAP coordination patterns

**Reading Path**:
1. ✅ [L1 Core Protocol](../01-architecture/l1-core-protocol.md) - Core types
2. ✅ [L2 Coordination](../01-architecture/l2-coordination-governance.md) - Coordination layer
3. ✅ [L3 Runtime & Glue](../01-architecture/l3-execution-orchestration.md) - Execution layer
4. ✅ [Cross-Cutting Concerns](../01-architecture/cross-cutting/overview.md) - System-wide concerns
5. ✅ [Module Interactions](../02-modules/module-interactions.md) - How modules interact
6. ✅ [MAP Profile](../03-profiles/mplp-map-profile.md) - Multi-agent coordination
7. ✅ [MAP Collaboration Diagram](../03-profiles/diagrams/map-collaboration.mmd) - Visual flow

---

### For Legal / Compliance Reviewers

**Goal**: Audit protocol for compliance, licensing, IP

**Reading Path**:
1. ✅ [Protocol Overview](mplp-v1.0-protocol-overview.md) - Scope and boundaries
2. ✅ [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md) - Requirements
3. ✅ [Compliance Checklist](../08-guides/mplp-v1.0-compliance-checklist.md) - Self-assessment
4. ✅ [Governance](../12-governance/versioning-policy.md) - Versioning and compatibility
5. ✅ [Release Notes](../13-release/mplp-v1.0.0-release-notes.md) - Official release statement
6. ✅ LICENSE (Apache-2.0 at repo root)

---

## Key Files Index

### Core Protocol Specifications

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Protocol Overview](mplp-v1.0-protocol-overview.md) | Overview | High-level architecture and concepts | 7 |
| [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md) | Guide | v1.0 requirements and boundaries | 1-6 |
| [Compliance Checklist](../08-guides/mplp-v1.0-compliance-checklist.md) | Guide | Self-assessment tool | 7 |
| [SA Profile](../03-profiles/mplp-sa-profile.md) | Profile | Single-agent execution semantics | 1 |
| [MAP Profile](../03-profiles/mplp-map-profile.md) | Profile | Multi-agent coordination semantics | 2 |

---

### Observability & Learning

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Observability Overview](../04-observability/mplp-observability-overview.md) | Overview | Event-driven observability (12 families) | 3 |
| [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml) | Taxonomy | Event family definitions | 3 |
| [Module→Event Matrix](../04-observability/module-event-matrix.md) | Matrix | Event emission obligations | 3 |
| [Learning Overview](../05-learning/mplp-learning-overview.md) | Overview | LearningSample data formats (6 families) | 4 |
| [Learning Taxonomy](../05-learning/mplp-learning-taxonomy.yaml) | Taxonomy | Sample family definitions | 4 |
| [Collection Points](../05-learning/learning-collection-points.md) | Spec | Recommended triggers | 4 |

---

### Runtime Glue & Integration

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md) | Overview | PSG-centric L3 behavioral specs | 5 |
| [Module→PSG Paths](../06-runtime/module-psg-paths.md) | Matrix | Read/write paths for 12 components | 5 |
| [Crosscut→PSG Binding](../06-runtime/crosscut-psg-event-binding.md) | Spec | 9 crosscut implementation patterns | 5 |
| [Drift Detection](../06-runtime/drift-detection-spec.md) | Spec | State validation mechanisms | 5 |
| [Rollback Spec](../06-runtime/rollback-minimal-spec.md) | Spec | PSG snapshot/restoration | 5 |
| [Integration Spec](../07-integration/mplp-minimal-integration-spec.md) | Spec | IDE/CI/Git/Tools integration (L4) | 6 |
| [Integration Taxonomy](../07-integration/integration-event-taxonomy.yaml) | Taxonomy | 4 integration event families | 6 |

---

### Testing & Validation

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Golden Suite Overview](../09-tests/golden-test-suite-overview.md) | Overview | 9 protocol-invariant flows | 1-6 |
| [Golden Suite Details](../09-tests/golden-test-suite-details.md) | Details | Test harness and CI integration | 7 |
| [Flow Registry](../09-tests/golden-flow-registry.md) | Registry | 25 Canonical Flows | 7 |

---

### Release Documentation

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Release Notes](../13-release/mplp-v1.0.0-release-notes.md) | Release | Official v1.0.0 release statement | 7 |
| [Governance Report](../13-release/mplp-v1.0-docs-governance-summary.md) | Report | Final v1.0 governance summary | 7 |

---

**End of MPLP v1.0 Documentation Map**
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
