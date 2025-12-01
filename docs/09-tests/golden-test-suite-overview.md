---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Golden Test Suite Overview

**MPLP v1.0 Protocol-Level Test Suite**
**Note**: This document is part of the **MPLP v1.0 Executable Specification**.

This document describes the 25 canonical Golden Flows that serve as the conformance test suite for MPLP v1.0 implementations. These flows span the complete protocol surface area and ensure cross-language behavioral consistency.

---

## 1.1 Test Suite Philosophy

The Golden Test Suite follows HTTP/gRPC-level golden test standards:

1. **Protocol-First**: Tests validate protocol semantics, not implementation details
2. **Cross-Language**: All flows must pass identically in TypeScript and Python
3. **Regression-Proof**: Any protocol change must update golden fixtures
4. **Complete Coverage**: All 10 L2 core modules are exercised across the 25 flows
5. **Real-World**: Flows represent actual production scenarios, not synthetic tests

---

## 1.2 MPLP v1.0 – Protocol Compliance Boundary

For MPLP v1.0, the **protocol-level compliance boundary** is defined as:

✅ **All L1 JSON Schemas validate correctly**, AND
✅ **FLOW-01 through FLOW-05 pass** with official fixtures and invariants

**FLOW-06 through FLOW-25** are recommended product-level scenarios, **NOT required** for baseline protocol compliance.
## Observability Layer Coverage

**Event Taxonomy**: Defined in [`docs/04-observability/mplp-event-taxonomy.yaml`](../04-observability/mplp-event-taxonomy.yaml)

**Core Event Schemas**:
- Base Event: [`mplp-event-core.schema.json`](../../schemas/v2/events/mplp-event-core.schema.json)
- **PipelineStageEvent**: [`mplp-pipeline-stage-event.schema.json`](../../schemas/v2/events/mplp-pipeline-stage-event.schema.json) - **REQUIRED for v1.0**
- **GraphUpdateEvent**: [`mplp-graph-update-event.schema.json`](../../schemas/v2/events/mplp-graph-update-event.schema.json) - **REQUIRED for v1.0**
- RuntimeExecutionEvent: [`mplp-runtime-execution-event.schema.json`](../../schemas/v2/events/mplp-runtime-execution-event.schema.json)

**Invariants**: [`observability-invariants.yaml`](../../schemas/v2/invariants/observability-invariants.yaml) (12 rules)

**Module Emission Matrix**: [`module-event-matrix.md`](../04-observability/module-event-matrix.md)

**Note**: v1.0 compliance focuses on FLOW-01~05. Observability events are defined as **protocol obligations** for runtimes:
- **REQUIRED**: PipelineStageEvent + GraphUpdateEvent
- **RECOMMENDED**: RuntimeExecutionEvent, IntentEvent, ImportProcessEvent
- Not yet covered by Golden Flows (schema + invariants + documentation define obligations)

---

## Learning Layer Coverage

**LearningSample Taxonomy**: Defined in [`docs/05-learning/mplp-learning-taxonomy.yaml`](../05-learning/mplp-learning-taxonomy.yaml)

**Learning Schemas** (6 families):
- Core Sample: [`mplp-learning-sample-core.schema.json`](../../schemas/v2/learning/mplp-learning-sample-core.schema.json)
- Intent Resolution: [`mplp-learning-sample-intent.schema.json`](../../schemas/v2/learning/mplp-learning-sample-intent.schema.json)
- Delta Impact: [`mplp-learning-sample-delta.schema.json`](../../schemas/v2/learning/mplp-learning-sample-delta.schema.json)
- Other families (pipeline_outcome, confirm_decision, graph_evolution, multi_agent_coordination) use core schema

**Invariants**: [`learning-invariants.yaml`](../../schemas/v2/invariants/learning-invariants.yaml) (12 rules)

**Collection Points**: [`learning-collection-points.md`](../05-learning/learning-collection-points.md)

**Example Samples**:
- Intent Resolution: [`flow-01-intent-sample.json`](../../examples/learning/flow-01-intent-sample.json)
- Confirm Decision: [`flow-05-confirm-sample.json`](../../examples/learning/flow-05-confirm-sample.json)

**Note**: v1.0 compliance does **NOT require** LearningSample emission. Learning layer defines:
- **REQUIRED**: Schema stability and conformance (when samples ARE emitted)
- **RECOMMENDED**: Sample collection at suggested triggers
- **Out of scope**: Training/storage strategies (product implementation)

---

## Runtime Glue & PSG Coverage (Documentation-Only)

**Runtime Glue Specifications**: Defined in [`docs/06-runtime/`](../06-runtime/)

**Core Documents**:
- [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md) - L2→L3→PSG layer model
- [Module→PSG Paths](../06-runtime/module-psg-paths.md) - Read/write matrix for 12 components
- [Crosscut→PSG & Events](../06-runtime/crosscut-psg-event-binding.md) - 9 crosscut bindings
- [Drift Detection Spec](../06-runtime/drift-detection-spec.md) - Minimal drift detection requirements
- [Rollback Minimal Spec](../06-runtime/rollback-minimal-spec.md) - PSG snapshot/restoration

**Note**: v1.0 compliance for Runtime Glue:
- **Documentation-based**: Golden Flows validate L1/L2 + Profiles only
- **PSG as Single Source of Truth**: All implementations MUST use PSG as authoritative state
- **Event Emissions**: GraphUpdateEvent + PipelineStageEvent REQUIRED (from Phase 3)
- **Drift/Rollback**: RECOMMENDED (not REQUIRED), but if implemented, MUST follow minimal specs

**Compliance Validation**: Runtime Glue compliance depends on:
1. Documentation match (Module→PSG mapping documented)
2. Event emission audit (GraphUpdateEvent, PipelineStageEvent present)
3. PSG-centric architecture (no scattered state)

---

## Integration Layer Coverage (Doc & Schema Only)

**Integration Specifications**: Defined in [`docs/07-integration/`](../07-integration/)

**Core Documents**:
- [Minimal Integration Spec](../07-integration/mplp-minimal-integration-spec.md) - L4 Boundary Layer for external tools
- [Integration Event Taxonomy](../07-integration/integration-event-taxonomy.yaml) - 4 event families
- [Tool Event Schema](../../schemas/v2/integration/mplp-tool-event.schema.json)
- [File Update Event Schema](../../schemas/v2/integration/mplp-file-update-event.schema.json)
- [Git Event Schema](../../schemas/v2/integration/mplp-git-event.schema.json)
- [CI Event Schema](../../schemas/v2/integration/mplp-ci-event.schema.json)
- [Integration Invariants](../../schemas/v2/invariants/integration-invariants.yaml) - 20 rules

**Example Payloads**:
- [IDE File Save](../../examples/integration/ide-file-save.json)
- [Git Push](../../examples/integration/git-push.json)
- [CI Build Finished](../../examples/integration/ci-build-finished.json)
- [Tool Execution](../../examples/integration/tool-execution.json)

**Note**: v1.0 compliance for Integration Layer:
- **NOT REQUIRED**: Integration is entirely optional for v1.0
- **RECOMMENDED**: If integrating external tools (IDE, CI, Git), use these specs
- **REQUIRED (if used)**: Integration events MUST conform to schemas & invariants
- **Relationship**: Integration events typically appear as ExternalIntegrationEvent.payload (from Phase 3)

**Compliance Validation**: Integration compliance depends on:
1. Schema conformance (Integration events pass JSON schema validation)
2. Invariant validation (Events pass integration-invariants.yaml)
3. Observability wrapping (Events wrapped as ExternalIntegrationEvent.payload)

---
| **FLOW-06** | Planner + Executor Dual Role | B: Multi-Agent | Context, Plan, Role, Collab, Trace | Two roles (planner, executor) collaborate on same context. Validates role separation, collaboration graph, and handoff semantics. | ⏳ Planned |
| **FLOW-07** | Multi-Role Dialog (3+ Roles) | B: Multi-Agent | Context, Plan, Role, Dialog, Collab, Trace | Three or more roles engage in structured dialog and collaborative reasoning. Dialog threads, role boundaries, and collaboration graph evolution must be properly serialized. | ⏳ Planned |
| **FLOW-08** | Conflicting Plans - Governance | B: Multi-Agent | Context, Plan, Role, Core, Collab, Trace | Multiple agents propose conflicting plans within the same context. The governance layer must detect inconsistencies, apply resolution policies, and record the resolution steps. | ⏳ Planned |
| **FLOW-09** | Multi-Agent Confirm Loop | B: Multi-Agent | Context, Plan, Confirm, Role, Collab, Trace | Multiple agents propose revisions to a plan and enter multi-round confirmation loops. Validates distributed confirmation and version convergence. | ⏳ Planned |
| **FLOW-10** | Long Dialog (10+ Turns) | B: Multi-Agent | Context, Dialog, Collab, Trace | Extended dialog session with graph evolution. Validates dialog state persistence, graph integrity over time, and event ordering. | ⏳ Planned |
| **FLOW-11** | High-Risk Plan → Mandatory Confirm | C: Risk/Security | Context, Plan, Confirm, Core, Trace | High-risk operation triggers mandatory confirmation with snapshot. Validates risk tagging, snapshot creation, and audit trail. | ⏳ Planned |
| **FLOW-12** | Forbidden Operation Rejection | C: Risk/Security | Context, Plan, Confirm, Core | Plan contains forbidden action, confirm must reject. Validates security policy enforcement, rejection reasons, and constraint checking. | ⏳ Planned |
| **FLOW-13** | Multi-Step Human-in-Loop | C: Risk/Security | Context, Plan, Confirm, Trace | Two-round confirmation (preliminary + final). Validates staged approval, intermediate snapshots, and human checkpoint semantics. | ⏳ Planned |
| **FLOW-14** | Full Audit Trail | C: Risk/Security | Context, Plan, Confirm, Trace, Core | All decisions logged to trace.events. Validates event completeness, temporal ordering, causality links, and audit compliance. | ⏳ Planned |
| **FLOW-15** | Permission Denied | C: Risk/Security | Context, Plan, Trace, Core | Execution aborted due to insufficient permissions. Validates permission checks, abort events, and reason codes in trace. | ⏳ Planned |
| **FLOW-16** | Runtime Error + Retry Success | D: Error Recovery | Context, Plan, Trace, Network | Runtime error on step 3, retry succeeds. Validates error capture, retry metadata, and recovery events in trace. | ⏳ Planned |
| **FLOW-17** | Runtime Error + Max Retries | D: Error Recovery | Context, Plan, Trace, Network | Error retry exceeds limit, execution fails. Validates retry exhaustion, failure events, and graceful degradation. | ⏳ Planned |
| **FLOW-18** | Semantic Drift Detection | D: Error Recovery | Context, Plan, Core, Trace | Plan/context semantic mismatch detected and rejected. Validates drift detection invariants, mismatch events, and validation failure paths. | ⏳ Planned |
| **FLOW-19** | Graph Drift + Rollback | D: Error Recovery | Context, Collab, Trace, Core | Collaboration graph drift triggers rollback. Validates graph snapshot, rollback events, and state restoration. | ⏳ Planned |
| **FLOW-20** | Tool Failure + Fallback | D: Error Recovery | Context, Plan, Extension, Trace, Network | Tool call fails, fallback strategy executes. Validates tool error handling, fallback metadata, and alternative execution paths. | ⏳ Planned |
| **FLOW-21** | Greenfield Import | E: Integration | Context, Core, Network, Trace | Greenfield import initializes a project with minimal inputs. Validates core import semantics: environment detection, context creation, and bootstrap metadata. | ⏳ Planned |
| **FLOW-22** | Brownfield Import | E: Integration | Context, Core, Network, Trace | Brownfield import consumes an existing repository, extracts structure, and populates semantic cards. Storage is an integration dimension; protocol verifies import steps and trace logs. | ⏳ Planned |
### L2 Core Module Coverage (10 Modules — Protocol Level)

> This table lists only **protocol-defined formal modules**. All L3/L4 capabilities are not included in this matrix.

| L2 Core Module | Flows Covering |
|----------------|----------------|
| **Context** | 01–25 (all flows use Context) |
| **Plan** | 01–24 (all flows except 25 contain Plan input or generation) |
| **Confirm** | 01, 05, 09, 11–15 |
| **Trace** | 01–20, 25 |
| **Role** | 06–10 |
| **Extension** | 03, 04, 20, 25 |
| **Dialog** | 07, 10 |
| **Collab** | 06–10, 19 |
| **Core** | 04, 08, 11–19, 21–25 |
| **Network** | 04, 16–17, 21–25 |

### L3/L4 Integration Dimensions (Non-Protocol Modules, Runtime Capabilities)

> These are not L2 modules, but runtime extension dimensions implemented via Extension / Network / AEL / VSL.

| Integration Dimension | Description | Flows Covering |
|-----------------------|-------------|----------------|
| **Tool Integration** | Execute tool calls via Extension + Network | 03, 20, 25 |
| **LLM Backend** | AEL (Action Execution Layer) uses external LLM for Plan enrichment / reasoning | 04, 25 |
| **Storage Integration** | L4 storage (file system / repo / key-value / vector) | 22, 25 |
| **Runtime Agent Execution** | Agent Runtime (Planner / Executor / Supervisor) | 06–10, 25 |
| **Project Import Pipeline** | Build initial Context via L4 Import Pipeline | 21, 22 |
| **Governance & Throttling** | L4 Governance Profiles / Budget / Cost | 23, 24 |

---

## Running Golden Tests

### TypeScript
```bash
# Run all golden flows
pnpm test:golden

# Expected output:
# 🚀 Starting Golden Test Suite...
# Found 25 flows.
# ...
# Summary: 25/25 Passed.
```

### Python
```bash
# Run all golden flows
PYTHONPATH=packages/sdk-py/src python -m pytest packages/sdk-py/tests/golden -v

# Expected output:
# 🔍 Validating FLOW-01: Single Agent Plan...
# ✅ PASS
# ...
# 📊 Summary: 25/25 Passed
# =================== 47 passed in X.XXs ==========================
```

### CI Integration
Both test suites run automatically in GitHub Actions. Any flow failure blocks merge.

---

## Fixture Structure

Each flow follows this directory structure:

```
tests/golden/flows/flow-XX-name/
├── README.md                 # Scenario description
├── input/
│   ├── context.json          # Input context
│   ├── plan.json             # Input plan (if applicable)
│   ├── confirm.json          # Input confirm (if applicable)
│   └── trace.json            # Input trace (if applicable)
├── expected/
│   ├── context.json          # Expected context output
│   ├── plan.json             # Expected plan output
│   ├── confirm.json          # Expected confirm output
│   ├── trace.json            # Expected trace output
│   └── events.json           # Expected events (if applicable)
└── invariants.yaml           # Flow-specific invariants (optional)
```

---

## Invariant Strategy

### Global Invariants (`tests/golden/invariants/*.yaml`)
- `context.yaml`: Context-level constraints (UUIDs, status, owner)
- `plan.yaml`: Plan-level constraints (step validity, wildcard checks)
- `confirm.yaml`: Confirm-level constraints (status, approvers)
- `trace.yaml`: Trace-level constraints (event ordering, causality)

### Flow-Specific Invariants
Individual flows can add `invariants.yaml` for scenario-specific rules (e.g., FLOW-12's forbidden operation checks).

### Complete Invariant Rule Catalog (v1.0)

The following 7 invariant rule types are available and used by FLOW-01~05:

| Rule Type | Syntax | Purpose | Introduced |
|-----------|--------|---------|------------|
| `uuid-v4` | `uuid-v4` | Validates UUID v4 format | FLOW-01 |
| `non-empty-string` | `non-empty-string` | Validates non-empty string fields | FLOW-01 |
| `exists` | `exists` | Validates field presence | FLOW-01 |
| `iso-datetime` | `iso-datetime` | Validates ISO 8601 datetime format | FLOW-01 |
| `eq(path)` | `eq(context.context_id)` | Cross-module ID binding validation | FLOW-05 |
| `min-length(N)` | `min-length(6)` | Minimum array/string length | FLOW-02 |
| `enum(...)` | `enum(pending,approved,rejected)` | Enumeration value validation | FLOW-02 |

**No new rule types** are planned for v1.0. Conditional invariants (`if(...)`) may be added in v1.x or v2.0.

---

## Implementation Status

### Phase 7.3 Milestones

- ✅ **P7.3.D**: TypeScript Golden Harness (FLOW-01 passing)
- ✅ **P7.3.E**: Python Golden Harness (FLOW-01 passing)
- ✅ **P7.3.F**: Category A Complete - **Protocol Invariant Milestone Achieved** (2025-11-30)
  - ✅ **FLOW-01**: Single Agent Plan - Baseline workflow
  - ✅ **FLOW-02**: Single Agent Large Plan - Volumetric scalability (25 steps)
  - ✅ **FLOW-03**: Single Agent with Tools - `agent_role` tool integration
  - ✅ **FLOW-04**: Single Agent LLM Enrichment - `agent_role` LLM integration
  - ✅ **FLOW-05**: Single Agent Confirm Required - Multi-round approval + Trace
  - **All flows**: TypeScript ✅ Python ✅ (5/5 pass rate)
  - ⏳ FLOW-06 - FLOW-25: Categories B-E (planned, not required for v1.0 compliance)

> **Protocol Invariant Milestone** (2025-11-30): FLOW-01 through FLOW-05 have locked down the minimum behavioral semantics for Context, Plan, Confirm, and Trace modules. These five flows define the **v1.0 compliance boundary**. Any implementation claiming MPLP v1.0 compatibility must pass these flows. Remaining flows (06-25) are reference implementations for product-level features.


### Completion Criteria (Per Category)
1. All flows in category have complete fixtures (input + expected)
2. All flows pass in both TypeScript and Python (no skipped tests)
3. All global + flow-specific invariants are defined and validated
4. Flow READMEs document scenario semantics
5. Documentation updated with Implemented status

### Gating Strategy
Each category (A-E) must be fully completed before proceeding to the next:
- **Category A complete** → proceed to B
- **Category B complete** → proceed to C
- **Category C complete** → proceed to D
- **Category D complete** → proceed to E
- **Category E complete** → P7.3.F done

---

## Related Documentation

- [MPLP Spec v1.0](../00-spec/mplp-spec-v1.0.md) - Full protocol specification
- [Schema Mapping Standard](../06-sdk/schema-mapping-standard.md) - Fixture format
- [Golden Fixture Format](../05-runtime/golden-fixture-format.md) - Fixture semantics
- [Integration Patterns](../05-runtime/integration-patterns.md) - Runtime integration

---

## Contributing Golden Flows

When adding new flows:

1. **Follow the 5-category structure** (A-E)
2. **Ensure cross-language alignment**: TS and Python must produce identical results
3. **Write comprehensive invariants**: Use wildcard paths extensively
4. **Document the scenario**: README.md must explain the "why"
5. **Test rigorously**: Flow must pass before marking as Implemented
6. **Respect L2/L3/L4 boundaries**: Only L2 modules in "Key L2 Coordination & Governance", integration dimensions separate

For questions or contributions, see [CONTRIBUTING.md](../../CONTRIBUTING.md).
