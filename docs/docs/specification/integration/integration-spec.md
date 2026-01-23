---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-INT-SPEC-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Integration Spec
sidebar_label: Integration Spec
sidebar_position: 1
description: "MPLP integration specification: Integration Spec. Defines external system integration requirements."
authority: Documentation Governance
---

# Integration Spec

## Scope

This specification defines the optional Integration Layer (L4) of MPLP, including event schemas for external tools.

## Non-Goals

This specification does not mandate the use of any specific external tool or CI/CD platform.



## 1. Integration Entities (4 Event Families)

### 1.1 TOOL_EVENT

**Purpose**: External tool invocation and results (formatters, linters, test runners, generators).

**Minimal Schema**:
```json
{
  "tool_id": "eslint-v8.54.0",
  "tool_kind": "formatter" | "linter" | "test_runner" | "generator" | "other",
  "invocation_id": "550e8400-...",  // UUID v4
  "status": "pending" | "running" | "succeeded" | "failed" | "cancelled"
}
```

**Use Cases**:
- Track linting violations over time
- Correlate test failures with code changes
- Monitor formatter application patterns

**Reference**: `schemas/v2/integration/mplp-tool-event.schema.json`

### 1.2 GIT_EVENT

**Purpose**: Git operations (commit, push, branch/merge/tag).

**Minimal Schema**:
```json
{
  "repo_url": "https://github.com/org/repo.git",
  "commit_id": "abc123def456...",
  "ref_name": "refs/heads/main",
  "event_kind": "commit" | "push" | "merge" | "tag" | "branch_create" | "branch_delete",
  "timestamp": "2025-11-30T11:30:00.000Z"
}
```

**Use Cases**:
- Record commits in PSG for audit trail
- Trigger CI pipelines on push
- Track collaboration patterns via commit history

**Reference**: `schemas/v2/integration/mplp-git-event.schema.json`

## 2. Minimal Requirements (Compliance Boundary)

### 2.1 MPLP v1.0 Compliance

**Integration Layer**:
- **NOT REQUIRED**: Integration is entirely optional for v1.0
- **RECOMMENDED**: If integrating external tools, use these specs
- **REQUIRED (if used)**: Must conform to Integration schemas & invariants

**Rationale**:
- MPLP v1.0 focuses on core protocol (L1/L2), not external tool integration
- Integration adds value but increases implementation complexity
- Vendors can choose which tools to integrate based on user needs

### 2.2 Conformance Requirements (When Implemented)

**If Runtime Fulfills Integration**:
1. Integration events MUST conform to `schemas/v2/integration/` schemas
2. Events MUST pass `schemas/v2/invariants/integration-invariants.yaml`
3. Events SHOULD be wrapped as `ExternalIntegrationEvent.payload` (from Phase 3)
4.  Transport mechanism (Webhook, MQ, file) is implementation-specific

## 3. Event Family Mapping

| Integration Event | Observability Wrapper | Phase 3 Family |
|-------------------|----------------------|----------------|
| `tool_event` | ExternalIntegrationEvent | ExternalIntegrationEvent |
| `file_update_event` | ExternalIntegrationEvent | ExternalIntegrationEvent |
| `git_event` | ExternalIntegrationEvent | ExternalIntegrationEvent |
| `ci_event` | ExternalIntegrationEvent | ExternalIntegrationEvent |

**Note**: All Integration events use `ExternalIntegrationEvent` as envelope.

## 4. PSG as Integration Context

**PSG provides context for integration events**:
- **File updates** query PSG for current project structure
- **Git commits** reference PSG plan nodes, context nodes
- **CI results** correlate with PSG pipeline state

## 5. Access Control

**Not in MPLP Scope**:
- Authentication mechanisms
- Authorization policies
- Event encryption in transit

**Implementation Responsibility**:
- Vendors SHOULD implement access control for integration endpoints
- Vendors SHOULD use secure transport (TLS) for event emission

## 6. Git Hook Integration Example

**Pseudo-code** (post-commit hook):
```bash
#!/bin/bash
# Git post-commit hook example for MPLP integration

COMMIT_ID=$(git rev-parse HEAD)
REF_NAME=$(git symbolic-ref HEAD)
AUTHOR_NAME=$(git log -1 --format='%an')


EVENT=$(cat <<EOF
{
  "repo_url": "$(git config --get remote.origin.url)",
  "commit_id": "$COMMIT_ID",
  "ref_name": "$REF_NAME",
  "event_kind": "commit",
  "author_name": "$AUTHOR_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"
}
EOF
)


curl -X POST http://localhost:8080/integration/git \
  -H "Content-Type: application/json" \
  -d "$EVENT"
```

## 7. Compliance Summary

### 7.1 v1.0 Requirements

**REQUIRED**: None (Integration is optional)

**RECOMMENDED** (if integrating external tools):
- Emit `file_update_event` for IDE file changes
- Emit `git_event` for Git operations
- Emit `ci_event` for CI pipeline status
- Emit `tool_event` for external tool invocations

**REQUIRED (if Integration events are emitted)**:
- Events MUST conform to Integration schemas
- Events MUST pass Integration invariants
- Events SHOULD be wrapped as ExternalIntegrationEvent.payload

## 8. References

**Integration Layer**:
- [Integration Event Taxonomy](../../../../schemas/v2/taxonomy/integration-event-taxonomy.yaml) (Schema Truth Source)
- `schemas/v2/integration/mplp-tool-event.schema.json`
- `schemas/v2/integration/mplp-file-update-event.schema.json`
- `schemas/v2/integration/mplp-git-event.schema.json`
- `schemas/v2/integration/mplp-ci-event.schema.json`
- `schemas/v2/invariants/integration-invariants.yaml`

**Related Phases**:
- [Phase 3: Observability Duties](../observability/observability-overview.md)
- [Phase 5: Runtime Glue](/docs/guides/runtime/runtime-glue-overview.md)

**Compliance**:
- [MPLP v1.0 Conformance Guide](/docs/guides/conformance-guide.md)

## 9. Best Practices

### 9.1 For Tool Builders (Adapters)

If you are building an adapter (e.g., a VS Code extension, a Git hook, or a CI plugin):

1. **Buffer Events**: Do not emit an event for every keystroke. Debounce file updates (e.g., emit on save or after 500ms of inactivity) to reduce noise.

2. **Use Standard Schemas**: Validate your payloads against `schemas/v2/integration/` before sending. Invalid events will be rejected by conformant runtimes.

3. **Handle Backpressure**: The runtime may not process events immediately. Implement a local queue or retry mechanism if delivery fails.

4. **Source Identity**: Always populate the `source` field (e.g., `vscode-plugin-v1.2`) to aid in debugging.

### 9.2 For Runtime Implementers

If you are building an MPLP Runtime:

1. **Idempotency**: Handle duplicate events gracefully. Use `timestamp` and `invocation_id` to deduplicate.

2. **Ordering**: Do not assume events arrive in perfect order. Use timestamps to reconstruct the causal timeline.

3. **Security**: Treat all external events as untrusted input. Sanitize file paths and content before updating the PSG to prevent injection attacks.

4. **Async Processing**: Decouple event ingestion from PSG updates to maintain UI responsiveness.

### 9.3 Error Handling Best Practices

- **Error Logging**: Log invalid integration events to a separate "Integration Error Log" for debugging.
- **Graceful Degradation**: If the Integration Layer fails, the core agent loop (L2/L3) should continue to function, albeit with reduced context awareness.

---

**End of MPLP Integration Spec**

*This specification defines the protocol-level data structures for external tool integration (IDE, CI, Git, Tools), enabling uniform integration patterns across MPLP-conformant runtimes while maintaining implementation flexibility.*```