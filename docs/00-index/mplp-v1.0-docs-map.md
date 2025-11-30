# MPLP v1.0 Documentation Map

**Version**: 1.0.0  
**Last Updated**: 2025-11-30  
**Purpose**: Complete navigation guide for MPLP Protocol v1.0 documentation

---

## Quick Start

**New to MPLP?** Start here:
1. Read [Protocol Overview](mplp-v1.0-protocol-overview.md) (20 min)
2. Review [Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md) (30 min)
3. Try [Golden Test Suite](../08-tests/golden-test-suite-overview.md) (15 min)

**Implementing MPLP?** Key documents:
- [Compliance Checklist](../02-guides/mplp-v1.0-compliance-checklist.md)
- [SA Profile](../03-profiles/mplp-sa-profile.md)
- [Observability Overview](../04-observability/mplp-observability-overview.md)
- [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)

---

## Documentation Structure (Directory Tree)

```
mplp-v1.0-protocol/
├── README.md                           # Project overview
├── CHANGELOG.md                        # Version history
├── schemas/v2/                         # JSON schemas
│   ├── context/                        # Context module schemas
│   ├── plan/                           # Plan module schemas
│   ├── confirm/                        # Confirm module schemas
│   ├── trace/                          # Trace module schemas
│   ├── observability/                  # Event schemas (Phase 3)
│   ├── learning/                       # LearningSample schemas (Phase 4)
│   ├── integration/                    # Integration event schemas (Phase 6)
│   └── invariants/                     # Protocol invariants
│       ├── core-invariants.yaml
│       ├── sa-invariants.yaml
│       ├── map-invariants.yaml
│       ├── observability-invariants.yaml
│       ├── learning-invariants.yaml
│       └── integration-invariants.yaml
├── docs/
│   ├── 00-index/                       # Navigation & overview (Phase 7)
│   │   ├── mplp-v1.0-docs-map.md       # This file
│   │   └── mplp-v1.0-protocol-overview.md
│   ├── 01-spec/                        # Legacy specifications
│   ├── 02-guides/                      # Implementation guides
│   │   ├── mplp-v1.0-compliance-guide.md
│   │   └── mplp-v1.0-compliance-checklist.md
│   ├── 03-profiles/                    # SA & MAP Profiles (Phase 1-2)
│   │   ├── mplp-sa-profile.md
│   │   ├── mplp-map-profile.md
│   │   ├── sa-event-schema.yaml
│   │   └── map-event-schema.yaml
│   ├── 04-observability/               # Observability layer (Phase 3)
│   │   ├── mplp-observability-overview.md
│   │   ├── mplp-event-taxonomy.yaml
│   │   └── module-event-matrix.md
│   ├── 05-learning/                    # Learning layer (Phase 4)
│   │   ├── mplp-learning-overview.md
│   │   ├── mplp-learning-taxonomy.yaml
│   │   └── learning-collection-points.md
│   ├── 06-runtime/                     # Runtime Glue (Phase 5)
│   │   ├── mplp-runtime-glue-overview.md
│   │   ├── module-psg-paths.md
│   │   ├── crosscut-psg-event-binding.md
│   │   ├── drift-detection-spec.md
│   │   └── rollback-minimal-spec.md
│   ├── 07-integration/                 # Integration layer (Phase 6)
│   │   ├── mplp-minimal-integration-spec.md
│   │   └── integration-event-taxonomy.yaml
│   ├── 08-tests/                       # Testing documentation
│   │   ├── golden-test-suite-overview.md
│   │   └── golden-test-suite-details.md
│   └── 09-release/                     # Release documentation (Phase 7)
│       └── mplp-v1.0-release-notes.md
├── tests/golden/                       # Golden test flows
│   ├── flows/                          # 9 test flows (FLOW-01~05, SA-01/02, MAP-01/02)
│   └── harness/                        # Test harnesses (TS + Python)
└── examples/                           # Example payloads
    ├── observability/                  # Event examples
    ├── learning/                       # LearningSample examples
    └── integration/                    # Integration event examples
```

---

## Documentation by Reader Role

### For Protocol Implementers

**Goal**: Implement an MPLP v1.0 compliant runtime

**Reading Path**:
1. ✅ [Protocol Overview](mplp-v1.0-protocol-overview.md) - Understand architecture
2. ✅ [Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md) - Know requirements
3. ✅ [Compliance Checklist](../02-guides/mplp-v1.0-compliance-checklist.md) - Self-assess
4. ✅ [SA Profile](../03-profiles/mplp-sa-profile.md) - Single-agent semantics
5. ✅ [Observability Overview](../04-observability/mplp-observability-overview.md) - Event requirements
6. ✅ [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md) - PSG-centric architecture
7. ✅ [Golden Test Suite](../08-tests/golden-test-suite-overview.md) - Validation

**Key Schemas**:
- `schemas/v2/context/`, `plan/`, `confirm/`, `trace/`
- `schemas/v2/invariants/core-invariants.yaml`
- `schemas/v2/observability/`

---

### For Runtime Developers

**Goal**: Build PSG, event emission, learning collection

**Reading Path**:
1. ✅ [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)
2. ✅ [Module→PSG Paths](../06-runtime/module-psg-paths.md) - Detailed mappings
3. ✅ [Crosscut→PSG Binding](../06-runtime/crosscut-psg-event-binding.md) - 9 crosscuts
4. ✅ [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml) - 12 event families
5. ✅ [Learning Taxonomy](../05-learning/mplp-learning-taxonomy.yaml) - 6 sample families
6. ✅ [Drift Detection](../06-runtime/drift-detection-spec.md) - State validation
7. ✅ [Rollback Spec](../06-runtime/rollback-minimal-spec.md) - Recovery mechanisms

**Key Schemas**:
- `schemas/v2/observability/` - Event schemas
- `schemas/v2/learning/` - LearningSample schemas
- `schemas/v2/invariants/observability-invariants.yaml`
- `schemas/v2/invariants/learning-invariants.yaml`

---

### For IDE / Tool Integrators

**Goal**: Integrate IDE, CI, Git, or external tools with MPLP runtime

**Reading Path**:
1. ✅ [Integration Spec](../07-integration/mplp-minimal-integration-spec.md)
2. ✅ [Integration Taxonomy](../07-integration/integration-event-taxonomy.yaml) - 4 event families
3. ✅ [Observability Overview](../04-observability/mplp-observability-overview.md) - ExternalIntegrationEvent
4. ✅ [Module→PSG Paths](../06-runtime/module-psg-paths.md) - How integration affects PSG

**Key Schemas**:
- `schemas/v2/integration/` - Integration event schemas
- `schemas/v2/invariants/integration-invariants.yaml`
- `examples/integration/` - Example payloads

---

### For Multi-Agent Researchers / Architects

**Goal**: Understand MAP coordination patterns

**Reading Path**:
1. ✅ [Protocol Overview](mplp-v1.0-protocol-overview.md) - High-level concepts
2. ✅ [SA Profile](../03-profiles/mplp-sa-profile.md) - Single-agent baseline
3. ✅ [MAP Profile](../03-profiles/mplp-map-profile.md) - Multi-agent coordination
4. ✅ [Crosscut→PSG Binding](../06-runtime/crosscut-psg-event-binding.md) - Coordination patterns
5. ✅ [Learning Taxonomy](../05-learning/mplp-learning-taxonomy.yaml) - multi_agent_coordination samples

**Key Schemas**:
- `schemas/v2/invariants/map-invariants.yaml`
- `docs/03-profiles/map-event-schema.yaml`
- `tests/golden/flows/map-flow-01-turn-taking/`
- `tests/golden/flows/map-flow-02-broadcast-fanout/`

---

### For Legal / Compliance Reviewers

**Goal**: Audit protocol for compliance, licensing, IP

**Reading Path**:
1. ✅ [Protocol Overview](mplp-v1.0-protocol-overview.md) - Scope and boundaries
2. ✅ [Release Notes](../09-release/mplp-v1.0-release-notes.md) - Official release statement
3. ✅ [Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md) - Requirements
4. ✅ [Golden Test Suite](../08-tests/golden-test-suite-overview.md) - Validation mechanism
5. ✅ LICENSE (Apache-2.0)

**Key Documents**:
- `README.md` - Project metadata
- `CHANGELOG.md` - Version history
- `docs/09-release/mplp-v1.0-release-notes.md` - Known limitations

---

## Key Files Index

### Core Protocol Specifications

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Protocol Overview](mplp-v1.0-protocol-overview.md) | Overview | High-level architecture and concepts | 7 |
| [Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md) | Guide | v1.0 requirements and boundaries | 1-6 |
| [Compliance Checklist](../02-guides/mplp-v1.0-compliance-checklist.md) | Guide | Self-assessment tool | 7 |
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
| [Golden Suite Overview](../08-tests/golden-test-suite-overview.md) | Overview | 9 protocol-invariant flows | 1-6 |
| [Golden Suite Details](../08-tests/golden-test-suite-details.md) | Details | Test harness and CI integration | 7 |
| `tests/golden/flows/` | Fixtures | Test flow fixtures (9 flows) | 1-6 |
| `tests/golden/harness/ts/` | Harness | TypeScript test runner | 1 |
| `tests/golden/harness/py/` | Harness | Python test runner | 1 |

---

### Schemas & Invariants

| Directory | Type | Description |
|-----------|------|-------------|
| `schemas/v2/context/` | Schemas | Context module JSON schemas |
| `schemas/v2/plan/` | Schemas | Plan module JSON schemas |
| `schemas/v2/confirm/` | Schemas | Confirm module JSON schemas |
| `schemas/v2/trace/` | Schemas | Trace module JSON schemas |
| `schemas/v2/observability/` | Schemas | Observability event schemas (Phase 3) |
| `schemas/v2/learning/` | Schemas | LearningSample schemas (Phase 4) |
| `schemas/v2/integration/` | Schemas | Integration event schemas (Phase 6) |
| `schemas/v2/invariants/` | Invariants | Protocol invariant rules (all phases) |

---

### Release Documentation

| File | Type | Description | Phase |
|------|------|-------------|-------|
| [Release Notes](../09-release/mplp-v1.0-release-notes.md) | Release | Official v1.0.0 release statement | 7 |
| `README.md` | Overview | Project README | All |
| `CHANGELOG.md` | Changelog | Version history | All |

---

## Machine-Readable Documentation Manifest

```yaml
version: "1.0.0"
protocol: "MPLP"
docs:
  # Navigation & Overview
  - id: docs-map
    path: docs/00-index/mplp-v1.0-docs-map.md
    kind: index
    audience: [all]
  
  - id: protocol-overview
    path: docs/00-index/mplp-v1.0-protocol-overview.md
    kind: overview
    audience: [all]
  
  # Compliance
  - id: compliance-guide
    path: docs/02-guides/mplp-v1.0-compliance-guide.md
    kind: guide
    audience: [implementer, auditor]
  
  - id: compliance-checklist
    path: docs/02-guides/mplp-v1.0-compliance-checklist.md
    kind: checklist
    audience: [implementer]
  
  # Profiles
  - id: sa-profile
    path: docs/03-profiles/mplp-sa-profile.md
    kind: profile
    phase: 1
    compliance: required
  
  - id: map-profile
    path: docs/03-profiles/mplp-map-profile.md
    kind: profile
    phase: 2
    compliance: recommended
  
  # Observability
  - id: observability-overview
    path: docs/04-observability/mplp-observability-overview.md
    kind: overview
    phase: 3
    compliance: required
  
  - id: event-taxonomy
    path: docs/04-observability/mplp-event-taxonomy.yaml
    kind: taxonomy
    phase: 3
  
  # Learning
  - id: learning-overview
    path: docs/05-learning/mplp-learning-overview.md
    kind: overview
    phase: 4
    compliance: recommended
  
  - id: learning-taxonomy
    path: docs/05-learning/mplp-learning-taxonomy.yaml
    kind: taxonomy
    phase: 4
  
  # Runtime Glue
  - id: runtime-glue-overview
    path: docs/06-runtime/mplp-runtime-glue-overview.md
    kind: overview
    phase: 5
    compliance: required
  
  - id: module-psg-paths
    path: docs/06-runtime/module-psg-paths.md
    kind: matrix
    phase: 5
  
  - id: crosscut-psg-binding
    path: docs/06-runtime/crosscut-psg-event-binding.md
    kind: spec
    phase: 5
  
  # Integration
  - id: integration-spec
    path: docs/07-integration/mplp-minimal-integration-spec.md
    kind: spec
    phase: 6
    compliance: optional
  
  - id: integration-taxonomy
    path: docs/07-integration/integration-event-taxonomy.yaml
    kind: taxonomy
    phase: 6
  
  # Testing
  - id: golden-suite-overview
    path: docs/08-tests/golden-test-suite-overview.md
    kind: overview
    phase: 1-6
  
  - id: golden-suite-details
    path: docs/08-tests/golden-test-suite-details.md
    kind: details
    phase: 7
  
  # Release
  - id: release-notes
    path: docs/09-release/mplp-v1.0-release-notes.md
    kind: release
    phase: 7
```

---

## Document Update History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-30 | Initial release (Phase 7 consolidation) |

---

## Support & Resources

**Questions?**
- GitHub Issues: [mplp-protocol/issues](https://github.com/org/mplp-protocol/issues)
- Discussion Forum: [mplp-protocol/discussions](https://github.com/org/mplp-protocol/discussions)

**External Implementations**:
- TracePilot: Reference runtime implementation
- Coregentis: Enterprise MPLP platform
- PublishPilot: Content generation with MPLP
- MRX Multi-Agent: MPLP-based multi-agent system

---

**End of MPLP v1.0 Documentation Map**

*This map provides complete navigation for the MPLP Protocol v1.0 specification package. All paths are relative to the repository root.*
