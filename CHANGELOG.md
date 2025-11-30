  - **FLOW-05** – Single Agent with Confirm Required (multi-round approval + trace)

- **Implemented cross-language Golden Harness**:
  - TypeScript harness (`tests/golden/harness/ts/*`)
  - Python harness (`packages/sdk-py/tests/golden/harness/*`)
  - BOM-safe JSON loaders, wildcard path support, and 7 invariant rule types:
    `uuid-v4`, `non-empty-string`, `exists`, `iso-datetime`, `eq(path)`, `min-length(N)`, `enum(...)`

- **Published MPLP v1.0 Compliance Guide** (`docs/02-guides/mplp-v1.0-compliance-guide.md`):
  - Defines v1.0 protocol compliance boundary as: All L1 schemas validate AND FLOWS 01–05 pass
  - Clarifies **locked** vs **open** L2 modules
  - Documents `agent_role` semantics, `Confirm.decisions[]` model, cross-module ID binding


- **Updated Golden Test Suite Overview** with v1.0 compliance boundary and L2 module status matrix
- **Cross-Language Equivalence**: Verified that runtime JSON output is structurally equivalent across TS and Python SDKs.
- **Error Consistency**: Ensured runtime errors produce consistent `ValidationResult` (path, code) in both SDKs.
- **CI Integration**: Added compatibility tests to GitHub Actions workflow.

- **SA Profile (Single Agent Profile)**:  
  - SA Profile YAML and Markdown specification  
  - SA Event schema (7 event types)  
  - SA Invariants  
  - SA minimal flows (sa-flow-01-basic, sa-flow-02-step-evaluation)  

- **MAP Profile (Multi-Agent Profile)**:  
  - MAP Profile YAML and Markdown specification  
  - MAP Event schema (9 event types)  
  - MAP Invariants  
  - MAP minimal flows (map-flow-01-turn-taking, map-flow-02-broadcast-fanout)  

- **Observability Duties (Protocol Layer)**:  
  - Event Taxonomy (12 families)  
  - Core event schemas (PipelineStageEvent, GraphUpdateEvent - REQUIRED)  
  - Module→Event Emission Matrix  
  - Observability invariants  

- **Learning Feedback Duties (Data Format Layer)**:  
  - LearningSample core schema + family-specific schemas (intent_resolution, delta_impact)  
  - Learning taxonomy (6 families: intent, delta, pipeline, confirm, graph, multi-agent)  
  - Collection points specification (RECOMMENDED triggers)  
  - Learning invariants (12 rules)  
  - Example LearningSample JSON files (flow-01-intent, flow-05-confirm)

- **Runtime Glue (L3 Documentation)**:  
  - Runtime Glue overview (L2→L3→PSG layer model)  
  - Module→Runtime→PSG read/write path matrix (12 components)  
  - Crosscut→PSG & events binding (9 crosscuts: coordination, error-handling, orchestration, performance, state-sync, transaction, etc.)  
  - Drift Detection minimal spec (PSG snapshot comparison, graph drift detection)  
  - Rollback minimal spec (PSG restoration, snapshot triggers, trace integration)

- **Minimal Integration Spec (L4 Boundary Layer)**:  
  - Integration event taxonomy (4 families: tool_event, file_update_event, git_event, ci_event)  
  - Integration schemas (tool, file-update, git, ci event payloads)  
  - Integration invariants (20 rules using existing types)  
  - Example integration payloads (IDE file save, Git push, CI build, tool execution)  
  - Integration overview with model, compliance boundaries, relationships to Observability/Runtime Glue

## [0.9.2-alpha] - 2025-11-29

### P7.H5 Validation Standardization
- **Core Protocol**: Standardized `ValidationResult` structure (ok, errors[]) across TS and Python.
- **Error Codes**: Implemented unified error codes (required, type, enum, pattern, format, etc.).
- **Cross-Language**: Verified strict error equivalence between TS (Ajv) and Python (Pydantic).
- **Python SDK**: Updated `validate_*` functions to return `ValidationResult` NamedTuple.

## [0.9.1-alpha] - 2025-11-29

### P7.H4 Cross-Language Builders
- **Builders**: Aligned JSON output of TS and Python builders.
- **Testing**: Added cross-language builder comparison infrastructure.

## [0.9.0-alpha] - 2025-11-29

### P0–P6 Completed
- **Schemas**: Migrated and standardized v2 schemas to `schemas/v2`.
- **Core Protocol**: Implemented `@mplp/core-protocol` with generated types and validators.
- **Coordination**: Implemented `@mplp/coordination` with flow contracts and event definitions.
- **Reference Runtime**: Implemented `@mplp/reference-runtime` with:
  - `RuntimeContext` and `RuntimeResult` types.
  - `InMemoryAEL` (Action Execution Layer) and `InMemoryVSL` (Value State Layer).
  - `runSingleAgentFlow` orchestrator.
- **Integration Layer**: Added `@mplp/integration-*` packages:
  - `llm-http`: Generic HTTP LLM client.
  - `tools-generic`: Abstract tool executor.
  - `storage-fs`: JSON file storage.
  - `storage-kv`: In-memory Key-Value store.
- **Examples**: Added `ts-single-agent-basic` runnable example.
