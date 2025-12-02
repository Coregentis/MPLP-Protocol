---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP v1.0 Compliance Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-30
**Audience**: Third-party runtime implementers, SDK developers, protocol certifiers

---

## 1. What is MPLP v1.0 Compliance?

MPLP (Multi-Agent Lifecycle Protocol) v1.0 defines a **protocol-level standard** for multi-agent coordination, not just a JSON schema specification.

An implementation is considered **MPLP v1.0 compliant** if and only if:

1. ✅ **All L1 JSON Schemas validate correctly** against the official schema definitions (`schemas/v2/**/*.schema.json`).
2. ✅ **FLOW-01 through FLOW-05 pass** in the implementation's test harness (see `docs/09-tests/golden-test-suite-overview.md`).
3. ✅ **`agent_role` semantics are preserved** for executor polymorphism.

**This is the complete compliance boundary for v1.0**. FLOW-06 through FLOW-25 are reference implementations and best practices, **not requirements** for baseline protocol compliance.

---

## 2. Compliance Levels

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

- **MUST / REQUIRED**: Absolute requirement for v1.0 compliance. Failure to implement means the runtime is NOT MPLP compliant.
  - *Example*: Implementing the 10 Core Modules, emitting Required Event Families.
- **SHOULD / RECOMMENDED**: Strong recommendation. Valid reasons may exist to ignore, but the full implications must be understood.
  - *Example*: Implementing the Learning Loop, collecting all 3 sample types.
- **MAY / OPTIONAL**: Truly optional. No compliance penalty for omission.
  - *Example*: Integration with specific external tools, advanced Observability metrics.

---

## 3. The Five Protocol-Invariant Flows

### FLOW-01: Single Agent Plan
**Purpose**: Baseline happy-path workflow
**Validates**:
- Context creation and immutability
- Plan structure (steps array, IDs, status)
- Basic invariants (UUID format, non-empty strings)

**Key Invariants**: 7 rules covering Context/Plan ID binding, step structure

### FLOW-02: Single Agent Large Plan
**Purpose**: Volumetric scalability
**Validates**:
- Large step arrays (25+ steps)
- `order_index` usage for explicit sequencing
- `min-length(N)` invariant rule

**Key Invariants**: 11 rules including step count minimums

### FLOW-03: Single Agent with Tools
**Purpose**: Tool integration via `agent_role`
**Validates**:
- `agent_role` as executor type indicator
- Tool roles: `curl_executor`, `jq_processor`
- Agent roles: `agent`
- Dependency chains between tool and agent steps

**Key Invariants**: 5 rules validating `agent_role` as non-empty string

### FLOW-04: Single Agent with LLM Enrichment
**Purpose**: LLM integration via `agent_role`
**Validates**:
- LLM roles: `llm_claude`, `llm_gpt`
- Heterogeneous executor composition (tool + LLM + agent)
- `agent_role` extensibility to any executor type

**Key Invariants**: 5 rules, same structure as FLOW-03

### FLOW-05: Single Agent with Confirm Required
**Purpose**: Multi-round approval workflow
**Validates**:
- Confirm module `decisions[]` array for multi-round approval
- Trace module event logging
- Cross-module ID binding via `eq()` invariant
- Confirm → Plan → Trace → Context reference integrity

**Key Invariants**: 13 rules including first use of `eq(path)` for ID binding

---

## 4. Compliance Testing Requirements

### 4.1 Mandatory Test Harness

Implementers MUST provide a Golden Test harness in their target language that:

1. **Loads flow fixtures** from the standard directory structure (`tests/golden/flows/`):
   ```
   flows/flow-NN-*/
     input/{context,plan,confirm}.json
     expected/{context,plan,confirm,trace}.json
     invariants.yaml
   ```

2. **Validates schema** using official MPLP v1.0 JSON Schemas (`schemas/v2/`).

3. **Applies invariants** using the 7 standard rule types:
   - `uuid-v4`
   - `non-empty-string`
   - `exists`
   - `min-length(N)`
   - `enum(A,B,C)`
   - `iso-datetime`
   - `eq(path)`

### 4.2 Evidence of Compliance

To claim compliance, an implementation MUST produce artifacts demonstrating:
- **Schema Validation Logs**: Showing all L1 objects pass validation.
- **Invariant Check Logs**: Showing all invariant rules pass for the 5 flows.
- **Runtime Event Logs**: Showing the emission of required event families (`docs/04-observability/mplp-event-taxonomy.yaml`).

---

## 5. Reference Documentation

- **Full Protocol Map**: `docs/00-index/mplp-v1.0-docs-map.md`
- **Module Specifications**: `docs/02-modules/`
- **Observability & Events**: `docs/04-observability/`
- **Golden Test Suite**: `docs/09-tests/golden-test-suite-overview.md`
   - `iso-datetime`
   - `eq(path)`
   - `min-length(N)`
   - `enum(v1,v2,...)`

4. **Produces deterministic results** (same fixtures → same pass/fail outcome)

### 3.2 Cross-Language Symmetry

MPLP v1.0 reference harnesses (TypeScript, Python) demonstrate **behavior symmetry**:
- Same fixtures produce identical validation results
- Same invariant failures across languages
- Same schema violation errors

Third-party harnesses in other languages (Go, Rust, Java, etc.) SHOULD aim for equivalent behavior.

### 3.3 Fixture Immutability

FLOW-01 through FLOW-05 fixtures are **frozen** as of v1.0 release. Implementers:
- ✅ MAY add FLOW-06+ for product-specific scenarios
- ❌ MUST NOT modify FLOW-01~05 fixtures or invariants
- ❌ MUST NOT weaken existing invariants to make tests pass

---

## 4. L2 Module Behavioral Invariants

### 4.1 Locked Modules (v1.0)

These modules have **behavioral invariants locked** via FLOW-01~05:

| Module | Locked Semantics | Via Flows |
|--------|------------------|-----------|
| **Context** | Immutable problem-domain anchor, ID binding | 01-05 |
| **Plan** | Step structure, `agent_role` polymorphism, status enum | 01-05 |
| **Confirm** | Multi-round approval via `decisions[]` array | 05 |
| **Trace** | Event logging, cross-module ID binding | 05 |

**Compliance Requirement**: Implementations MUST behave consistently with these semantics.

### 4.2 Open Modules (v1.0)

These modules have **structure defined, behavior open**:

| Module | v1.0 Status | Notes |
|--------|-------------|-------|
| **Dialog** | Schema-only | Conversation threading vendor-specific |
| **Collab** | Schema-only | Multi-agent topology vendor-specific |
| **Extension** | Schema-only | Plugin system vendor-specific |
| **Core** | Schema-only | Governance vendor-specific |
| **Network** | Schema-only | Transport metadata vendor-specific |

**Compliance Requirement**: Implementations MUST validate schemas but MAY define custom behaviors.

### 4.3 Observability Duties (v1.0 Protocol Obligations)

**REQUIRED Events** for v1.0 compliance:

| Event Family | Emission Requirement | Schema |
|--------------|---------------------|--------|
| **PipelineStageEvent** | MUST emit for every pipeline stage transition | [`mplp-pipeline-stage-event.schema.json`](../../schemas/v2/events/mplp-pipeline-stage-event.schema.json) |
| **GraphUpdateEvent** | MUST emit for every PSG structural change | [`mplp-graph-update-event.schema.json`](../../schemas/v2/events/mplp-graph-update-event.schema.json) |

**Compliance Requirements**:
1. ✅ **Emit PipelineStageEvent** for each pipeline stage entry/exit
2. ✅ **Emit GraphUpdateEvent** for all PSG node/edge add/update/delete operations
3. ✅ **Conform to event schemas** with all minimal fields present
4. ✅ **Satisfy observability invariants** defined in [`observability-invariants.yaml`](../../schemas/v2/invariants/observability-invariants.yaml)

**Recommended Events** (best practice, not mandatory):
- RuntimeExecutionEvent (execution tracking)
- IntentEvent (user interaction capture)
- ImportProcessEvent (project lifecycle)
- CostAndBudgetEvent (cost monitoring)

**References**:
- [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml) - 12 event families
- [Module→Event Matrix](../04-observability/module-event-matrix.md) - Per-module obligations
- [Observability Overview](../04-observability/mplp-observability-overview.md)

### 4.5 Learning Layer (Optional but Recommended)

MPLP v1.0 defines a **LearningSample** data format and recommended collection points for training samples.

**Data Format Requirements** (if LearningSamples are emitted):
- ✅ Must conform to schemas in `schemas/v2/learning/`
- ✅ Must include `sample_id` (UUID v4), `sample_family`, `created_at`, `input`, `output`
- ✅ Must follow taxonomy in `mplp-learning-taxonomy.yaml`

**6 Sample Families**:
1. intent_resolution - User intent clarification patterns
2. delta_impact - Change effect analysis
3. pipeline_outcome - Pipeline success/failure patterns
4. confirm_decision - Approval/rejection patterns
5. graph_evolution - PSG structural evolution
6. multi_agent_coordination - SA/MAP collaboration performance

**Collection Points**: See [`learning-collection-points.md`](../05-learning/learning-collection-points.md) for recommended triggers.

**Compliance Note**: Learning sample emission is **RECOMMENDED**, NOT REQUIRED for v1.0 protocol compliance. Runtimes are free to choose storage/training strategies.

**References**:
- [LearningSample Taxonomy](../05-learning/mplp-learning-taxonomy.yaml)
- [Core Schema](../../schemas/v2/learning/mplp-learning-sample-core.schema.json)
- [Learning Overview](../05-learning/mplp-learning-overview.md)

---

## 5. Runtime Glue & PSG Requirements

MPLP v1.0 defines **Runtime Glue** specifications for how L2 modules interact with the **Project Semantic Graph (PSG)** through runtime behaviors.

### 5.1 Core Principle: PSG as Single Source of Truth

**Requirement**: All runtime implementations MUST use PSG as the authoritative source for project state.

**Implications**:
- ✅ L2 objects (Context, Plan, Trace, etc.) are **projections** of PSG state
- ✅ Queries for project data MUST query PSG, not scattered in-memory caches
- ✅ State consistency validated against PSG

---

### 5.2 Module→PSG Mapping (REQUIRED Documentation)

**Requirement**: Implementations MUST document their Module→PSG mapping.

**Documentation Should Include**:
1. Which PSG areas each module touches (e.g., `Context → psg.project_root`)
2. Access modes (READ, WRITE, READ-WRITE)
3. Ownership (primary, shared, derived)
4​. Event hooks triggered by PSG updates

**Reference**: [Module→PSG Paths Matrix](../06-runtime/module-psg-paths.md)

---

### 5.3 Event Emission Requirements (From Runtime Glue)

**REQUIRED Events** (tied to PSG/Pipeline):
1. ✅ **GraphUpdateEvent** (MUST): For all PSG structural changes
   - Emitted by PSG Runtime component
   - `update_kind`: node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk
2. ✅ **PipelineStageEvent** (MUST): For all pipeline stage transitions
   - Emitted by Pipeline Controller
   - `stage_status`: pending, running, completed, failed, skipped

**RECOMMENDED Events**:
- RuntimeExecutionEvent for agent/tool/LLM invocations
- MAP events for multi-agent coordination (Profile-specific)

---

### 5.4 Crosscut Bindings (DOCUMENTED)

**Requirement**: Implementations SHOULD document how crosscutting concerns are realized.

**9 MPLP Crosscuts**:
1. coordination - Multi-agent collaboration
2. error-handling - Failure detection and recovery
3. event-bus - Event routing
4. orchestration - Pipeline/plan execution control
5. performance - Timing and cost tracking
6. protocol-version - Version compatibility
7. security - Access control
8. state-sync - PSG consistency
9. transaction - Atomicity for grouped operations

**Reference**: [Crosscut→PSG & Events Binding](../06-runtime/crosscut-psg-event-binding.md)

---

### 5.5 Drift Detection & Rollback (RECOMMENDED)

**Drift Detection**:
- ⚠️ RECOMMENDED (not REQUIRED) for v1.0
- IF implemented: MUST use PSG snapshot comparison
- Detect: missing nodes, extra nodes, attribute mismatches

**Rollback**:
- ⚠️ RECOMMENDED (not REQUIRED) for v1.0
- IF implemented: MUST restore PSG from snapshot
- MUST record rollback in Trace + emit GraphUpdateEvent (bulk)

**References**:
- [Drift Detection Minimal Spec](../06-runtime/drift-detection-spec.md)
- [Rollback Minimal Spec](../06-runtime/rollback-minimal-spec.md)

---

### 5.6 Runtime Glue Compliance Summary

**v1.0 REQUIRED**:
1. ✅ Document Module→PSG mapping
2. ✅ Use PSG as single source of truth
3. ✅ Emit GraphUpdateEvent for all PSG changes
4. ✅ Emit PipelineStageEvent for all stage transitions

**v1.0 RECOMMENDED**:
- ⚠️ Implement minimal drift detection
- ⚠️ Support PSG snapshot/rollback
- ⚠️ Emit RuntimeExecutionEvent

**NOT REQUIRED**:
- ❌ Specific PSG storage engine
- ❌ Enterprise-grade HA/DR
- ❌ Distributed transaction (2PC/saga)

---

## 6. Minimal Integration (Optional)

MPLP v1.0 defines **Minimal Integration** specifications for external tool integration (IDE, CI, Git, Tools) as L4 Boundary Layer.

### 6.1 Core Principle: Integration is OPTIONAL

**Requirement**: Integration Layer is entirely OPTIONAL for v1.0 compliance.

**Implications**:
- ❌ Runtimes do NOT need to integrate with IDE/CI/Git to claim v1.0 compatibility
- ✅ IF integrating external tools, RECOMMENDED to use Integration specs
- ✅ IF emitting Integration events, MUST conform to Integration schemas & invariants

---

### 6.2 Integration Event Families (4 Types)

**If Runtime Integrates External Tools**, it SHOULD emit:

1. **tool_event**: External tool invocation/results (formatters, linters, test runners)
   - Schema: [`mplp-tool-event.schema.json`](../../schemas/v2/integration/mplp-tool-event.schema.json)

2. **file_update_event**: IDE file changes (save, refactor, delete)
   - Schema: [`mplp-file-update-event.schema.json`](../../schemas/v2/integration/mplp-file-update-event.schema.json)

3. **git_event**: Git operations (commit, push, merge, tag)
   - Schema: [`mplp-git-event.schema.json`](../../schemas/v2/integration/mplp-git-event.schema.json)

4. **ci_event**: CI pipeline execution status
   - Schema: [`mplp-ci-event.schema.json`](../../schemas/v2/integration/mplp-ci-event.schema.json)

**Reference**: [Integration Event Taxonomy](../07-integration/integration-event-taxonomy.yaml)

---

### 6.3 Conformance Requirements (When Implemented)

**If Runtime Emits Integration Events**:
1. ✅ Events MUST conform to Integration schemas
2. ✅ Events MUST pass Integration invariants
3. ✅ Events SHOULD be wrapped as `ExternalIntegrationEvent.payload` (from Phase 3 Observability)
4. ⚠️ Transport mechanism (Webhook, MQ, file) is implementation-specific

---

### 6.4 Relationship to Observability & Runtime Glue

**Integration → Observability**:
- Integration events typically appear as `ExternalIntegrationEvent.payload`
- `event_family` = "ExternalIntegrationEvent"
- `payload` conforms to Integration schemas

**Integration → Runtime Glue**:
- Integration events trigger PSG updates (file_update → PSG node update)
- CI events correlate with PipelineStageEvent
- Git events create PSG commit records

**References**:
- [Minimal Integration Spec](../07-integration/mplp-minimal-integration-spec.md)
- [Integration Invariants](../../schemas/v2/invariants/integration-invariants.yaml)

---

### 6.5 Integration Compliance Summary

**v1.0 OPTIONAL**:
- Integration Layer is NOT REQUIRED

**v1.0 RECOMMENDED** (if integrating):
- Emit `file_update_event` for IDE file changes
- Emit `git_event` for Git operations
- Emit `ci_event` for CI pipeline status
- Emit `tool_event` for external tool invocations

**v1.0 REQUIRED** (if Integration events are emitted):
1. ✅ Conform to Integration schemas
2. ✅ Pass Integration invariants

**NOT REQUIRED**:
- ❌ Specific IDE implementations
- ❌ Specific CI platforms
- ❌ Transport mechanisms
- ❌ Bidirectional integration patterns

---

## 5. Key Protocol Semantics

## 5. Key Protocol Semantics

### 5.1 `agent_role` as Executor Polymorphism Hook

**Design Principle**: The `agent_role` field in `Plan.steps[*]` is MPLP's universal mechanism for indicating step executor type.

**Standard Values** (established by FLOW-03, FLOW-04):
- `"agent"` - Standard agent logic
- `"curl_executor"`, `"jq_processor"` - Tool executors
- `"llm_claude"`, `"llm_gpt"` - LLM executors

**Extensibility**: Implementations MAY define custom executor types by using new `agent_role` values (e.g., `"db_postgres"`, `"api_rest"`). Schema modification is NOT required.

**Compliance**: Implementations MUST recognize at minimum the `"agent"` role.

### 5.2 Confirm Multi-Round Approval via `decisions[]`

**Design Principle**: Plan versioning is NOT part of MPLP v1.0. Multi-round approval is tracked via Confirm's `decisions[]` array.

**Behavior**:
- Each approval round creates a new decision in the array
- Decision structure: `{decision_id, status, decided_by_role, decided_at, reason}`
- Confirm overall `status` = latest decision status
- Plans remain immutable during approval cycles

**Compliance**: Implementations claiming Confirm support MUST use `decisions[]` for multi-round tracking.

### 5.3 Cross-Module ID Binding

**Design Principle**: All module objects reference each other via UUID fields, validated by `eq(path)` invariants.

**Standard Bindings**:
- `Plan.context_id` → `Context.context_id`
- `Confirm.target_id` → `Plan.plan_id`
- `Trace.context_id` → `Context.context_id`
- `Trace.plan_id` → `Plan.plan_id`

**Compliance**: Implementations MUST maintain referential integrity.

---

## 6. Certification Process (Optional)

Organizations wishing to obtain **official MPLP v1.0 certification** may:

1. Run the reference Golden Harness (TypeScript or Python) with FLOW-01~05
2. Submit test results showing 5/5 PASS
3. Demonstrate schema validation compliance
4. Request certification badge from Coregentis

**Note**: Certification is optional. Self-declaration of compliance is acceptable for open-source implementations.

---

## 7. FAQ

**Q: Do I need to implement all 25 flows?**
A: No. Only FLOW-01~05 are required for v1.0 compliance. FLOW-06~25 are reference implementations.

**Q: Can I add custom fields to Plan/Context?**
A: No. `additionalProperties: false` in schemas prohibits extensions. Use the Extension module for custom data.

**Q: What if my runtime uses a different executor model than `agent_role`?**
A: You must map your internal model to `agent_role` values for protocol compliance. Internal implementation can differ.

**Q: Can I modify FLOW-01~05 fixtures to fit my runtime?**
A: No. Fixtures are frozen. If your runtime cannot pass them as-is, it is not v1.0 compliant.

**Q: What about Plan versioning / revision tracking?**
A: Not part of v1.0. Use Confirm `decisions[]` for approval history. Plan versioning may be added in v1.x or v2.0.

---

## 8. References

- [MPLP Specification v1.0](../01-architecture/l1-core-protocol.md)
- [Golden Test Suite Overview](../09-tests/golden-test-suite-overview.md)
- [JSON Schemas](../../schemas/v2/)
- [TypeScript Harness](../../tests/golden/harness/ts/)
- [Python Harness](../../packages/sdk-py/tests/golden/harness/)

---

**End of MPLP v1.0 Compliance Guide**

*For questions or certification inquiries, contact: protocol@coregentis.com*
