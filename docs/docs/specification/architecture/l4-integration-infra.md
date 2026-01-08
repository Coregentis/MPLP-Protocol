---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-L4-001"
repo_refs:
  schemas:
    - "schemas/v2/integration/"
    - "schemas/v2/invariants/integration-invariants.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: L4 Integration Infrastructure
sidebar_label: L4 Integration Infrastructure
sidebar_position: 4
description: "MPLP architecture documentation: L4 Integration Infrastructure. Defines structural requirements and layer responsibilities."
---

# L4 Integration Infrastructure

## Scope

This specification defines the **optional integration layer** for external systems, including:
- 4 Integration event schemas (File, Git, CI, Tool)
- 19 Invariant rules for integration events
- Adapter patterns and event routing

**Note:** L4 is OPTIONAL for v1.0 compliance. Implementations can achieve conformance without any L4 support.

## Non-Goals

This specification does not define protocol data structures (L1), execution logic (L3), or state management (L3).

---

## 1. Purpose

The **L4 Integration Infrastructure** layer defines standard interfaces for external systems to interact with MPLP runtimes.

## 2. Scope & Boundaries

### 2.1 L4 Encompasses

Based on actual schemas (`schemas/v2/integration/`) and integration docs (`docs/07-integration/`):

1.  **4 Integration Event Schemas**: File, Git, CI, Tool events
2.  **19 Invariant Rules**: From `schemas/v2/invariants/integration-invariants.yaml`
3.  **Adapter Specifications**: How external systems translate native events to MPLP format
4.  **Event Routing**: How L3 Runtime consumes integration events

### 2.2 L4 Explicitly Excludes

- **Protocol Data Structures** (L1): Schemas define integration events, not core MPLP objects
- **Execution Logic** (L3): L4 emits events, L3 processes them
- **State Management** (L3): PSG updates triggered by L4 events are L3's responsibility

### 2.3 Optional Status

**L4 is OPTIONAL for v1.0 compliance**. Implementat

ions can:
- Skip L4 entirely (valid for standalone runtimes)
- Implement 1-3 integration types (e.g., Git only)
- Implement all 4 integration types (IDE, Git, CI, Tool)

**IF** L4 is implemented, schemas MUST be followed for interoperability.

## 3. Four Integration Categories

###  3.1 Category Overview

From `docs/07-integration/integration-spec.md`:

| Category | Purpose | Example Systems | Schema |
|:---|:---|:---|:---|
| **Development Environment (IDE)** | File edits, user intent | VS Code, JetBrains, Cursor | `mplp-file-update-event.schema.json` |
| **Version Control (Git)** | Project history, collaboration events | GitHub, GitLab, Bitbucket | `mplp-git-event.schema.json` |
| **Continuous Integration (CI)** | Build/test status | GitHub Actions, Jenkins, CircleCI | `mplp-ci-event.schema.json` |
| **External Tools** | Linters, formatters, analyzers | ESLint, Prettier, pytest | `mplp-tool-event.schema.json` |

## 4. Integration Event Schemas

### 4.1 File Update Event

**Schema**: `schemas/v2/integration/mplp-file-update-event.schema.json` (2,132 bytes)

**Purpose**: Notify runtime of file system changes from IDE

**Required Fields**:
```json
{
  "file_path": "src/index.ts",        // Absolute or relative path
  "change_type": "modified",          // created | modified | deleted | renamed
  "timestamp": "2025-12-06T12:00:00Z" // ISO 8601
}
```

**Optional Fields**:
- `old_path`: For `renamed` change_type
- `content_hash`: Checksum for drift detection
- `editor_source`: IDE identifier (e.g., "vscode-1.85")

**Use Cases**:
1. **Drift Detection**: Runtime compares file timestamp vs. PSG timestamp
2. **Auto-Reconciliation**: Update PSG Plan steps based on file changes
3. **Audit Trail**: Log all file modifications in Trace

**Example**:
```json
{
  "file_path": "/workspace/src/utils.ts",
  "change_type": "modified",
  "timestamp": "2025-12-06T14:32:15.789Z",
  "content_hash": "sha256:abc123...",
  "editor_source": "cursor-0.42"
}
```

### 4.2 Git Event

**Schema**: `schemas/v2/integration/mplp-git-event.schema.json` (2,575 bytes, 105 lines)

**Purpose**: Capture Git operations for project history tracking

**Required Fields** (from schema lines 91-96):
```json
{
  "repo_url": "https://github.com/org/repo.git",
  "commit_id": "abc123def456",        // Commit SHA
  "ref_name": "refs/heads/main",      // Branch/tag name
  "event_kind": "commit",             // See enum below
  "timestamp": "2025-12-06T12:00:00Z"
}
```

**6 Event Kinds** (from schema lines 40-47):
1. `commit` - New commit created
2. `push` - Commits pushed to remote
3. `merge` - Branch merge completed
4. `tag` - Tag created/pushed
5. `branch_create` - New branch created
6. `branch_delete` - Branch deleted

**Optional Fields**:
- `author_name`, `author_email`: Commit author (email format validated)
- `commit_message`: First line or summary
- `files_changed`, `insertions`, `deletions`: Commit stats
- `parent_commits[]`: Parent SHAs (multiple for merges)

**Use Cases**:
1. **Commit Tracking**: Link commits to Plan steps
2. **Merge Detection**: Trigger reconciliation on branch merges
3. **Tag Notifications**: Alert on version releases
4. **Blame Integration**: Associate code changes with Steps/Agents

**Example (Merge Event)**:
```json
{
  "repo_url": "git@github.com:org/repo.git",
  "commit_id": "1a2b3c4d5e6f7g8h9i0j",
  "ref_name": "refs/heads/main",
  "event_kind": "merge",
  "author_name": "Alice Developer",
  "author_email": "alice@example.com",
  "commit_message": "Merge pull request #42",
  "timestamp": "2025-12-06T15:45:00.000Z",
  "files_changed": 12,
  "insertions": 250,
  "deletions": 80,
  "parent_commits": ["parent1sha", "parent2sha"]
}
```

### 4.3 CI Event

**Schema**: `schemas/v2/integration/mplp-ci-event.schema.json` (3,277 bytes)

**Purpose**: Track CI/CD pipeline status for build validation

**Required Fields**:
```json
{
  "ci_provider": "github-actions",   // Provider identifier
  "pipeline_id": "workflow-123",     // Pipeline/workflow ID
  "run_id": "run-456",               // Specific run ID
  "status": "succeeded"              // pending | running | succeeded | failed | cancelled
}
```

**Optional Fields**:
- `started_at`, `completed_at`: ISO 8601 timestamps
- `duration_ms`: Execution time in milliseconds
- `trigger_event`: What triggered the run (e.g., "push", "pull_request")
- `branch_name`: Target branch
- `commit_sha`: Associated commit
- `build_url`: Link to CI dashboard

**Use Cases**:
1. **Build Status Tracking**: Know if Plan changes break tests
2. **Deployment Gates**: Block Plan completion until CI passes
3. **Performance Monitoring**: Track build time trends
4. **Failure Notifications**: Alert agents on test failures

**Example**:
```json
{
  "ci_provider": "jenkins",
  "pipeline_id": "build-api-server",
  "run_id": "42",
  "status": "failed",
  "started_at": "2025-12-06T16:00:00.000Z",
  "completed_at": "2025-12-06T16:05:30.000Z",
  "duration_ms": 330000,
  "trigger_event": "push",
  "branch_name": "feature/new-endpoint",
  "commit_sha": "abc123",
  "build_url": "https://jenkins.example.com/job/build-api-server/42"
}
```

### 4.4 Tool Event

**Schema**: `schemas/v2/integration/mplp-tool-event.schema.json` (2,393 bytes)

**Purpose**: Capture external tool invocations (linters, formatters, etc.)

**Required Fields**:
```json
{
  "tool_id": "eslint",               // Tool identifier
  "tool_kind": "linter",             // formatter | linter | test_runner | generator | other
  "invocation_id": "uuid-v4",        // UUID v4 for this invocation
  " status": "succeeded"              // pending | running | succeeded | failed | cancelled
}
```

**5 Tool Kinds** (from invariants):
1. `formatter` - Code formatters (Prettier, Black, gofmt)
2. `linter` - Static analysis (ESLint, Pylint, golangci-lint)
3. `test_runner` - Test execution (pytest, Jest, JUnit)
4. `generator` - Code generation (Protobuf, OpenAPI)
5. `other` - Catch-all for custom tools

**Optional Fields**:
- `started_at`: ISO 8601 timestamp
- `duration_ms`: Execution time
- `exit_code`: Process exit code
- `output`: Tool stdout/stderr (truncated)
- `file_paths[]`: Affected files

**Use Cases**:
1. **Code Quality Gates**: Block Plan steps if linter fails
2. **Auto-Formatting**: Trigger formatters after code generation
3. **Test Validation**: Verify generated code passes tests
4. **Metrics Collection**: Track tool execution times

**Example**:
```json
{
  "tool_id": "prettier",
  "tool_kind": "formatter",
  "invocation_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "succeeded",
  "started_at": "2025-12-06T17:00:00.000Z",
  "duration_ms": 1250,
  "exit_code": 0,
  "file_paths": ["src/index.ts", "src/utils.ts"]
}
```

## 5. Integration Invariants (19 Rules)

From `schemas/v2/invariants/integration-invariants.yaml` (4,489 bytes, 138 lines):

**Tool Events** (5 rules):
- `integration_tool_event_id_non_empty`: `tool_id` required
- `integration_tool_kind_valid`: {formatter, linter, test_runner, generator, other}
- `integration_tool_invocation_id_uuid`: UUID v4 format
- `integration_tool_status_valid`: {pending, running, succeeded, failed, cancelled}
- `integration_tool_started_at_iso`: ISO 8601 if present

**File Update Events** (3 rules):
- `integration_file_path_non_empty`: `file_path` required
- `integration_file_change_type_valid`: {created, modified, deleted, renamed}
- `integration_file_timestamp_iso`: ISO 8601 required

**Git Events** (5 rules):
- `integration_git_repo_url_non_empty`, `integration_git_commit_id_non_empty`, `integration_git_ref_name_non_empty`
- `integration_git_event_kind_valid`: {commit, push, merge, tag, branch_create, branch_delete}
- `integration_git_timestamp_iso`: ISO 8601 required

**CI Events** (4 rules):
- `integration_ci_provider_non_empty`, `integration_ci_pipeline_id_non_empty`, `integration_ci_run_id_non_empty`
- `integration_ci_status_valid`: {pending, running, succeeded, failed, cancelled}
- - Optional timestamp rules for `started_at`, `completed_at`

**Total**: 19 rules (5 tool + 3 file + 5 git + 6 CI)

## 6. Adapter Architecture

### 6.1 Adapter Pattern

<MermaidDiagram id="13d010945f38b1b8" />

**Adapter Responsibilities**:
1. **Subscribe** to native events from external system
2. **Transform** native event to MPLP integration event schema
3. **Validate** against JSON Schema
4. **Emit** to L3 Runtime event bus

### 6.2 Example: VS Code Adapter

**Native Event** (VS Code API):
```typescript
vscode.workspace.onDidChangeTextDocument(event => {
  const document = event.document;
  // event contains: document, contentChanges[]
});
```

**Adapter Transformation**:
```typescript
const mplpEvent: FileUpdateEvent = {
  file_path: document.fileName,
  change_type: "modified",
  timestamp: new Date().toISOString(),
  editor_source: "vscode-1.85"
};

// Validate against schema
const valid = validateFileUpdateEvent(mplpEvent);
if (!valid) {
  console.error("Invalid MPLP event:", validateFileUpdateEvent.errors);
  return;
}

// Emit to runtime
runtimeEventBus.emit('integration.file_update', mplpEvent);
```

### 6.3 Example: GitHub Actions Adapter

**Native Event** (GitHub Webhook):
```json
{
  "action": "completed",
  "workflow_run": {
    "id": 123456,
    "status": "completed",
    "conclusion": "success",
    "created_at": "2025-12-06T12:00:00Z"
  }
}
```

**Adapter Transformation**:
```typescript
const mplpEvent: CIEvent = {
  ci_provider: "github-actions",
  pipeline_id: webhook.workflow_run.name,
  run_id: String(webhook.workflow_run.id),
  status: mapStatus(webhook.workflow_run.conclusion), // "success" "succeeded"
  started_at: webhook.workflow_run.created_at,
  completed_at: webhook.workflow_run.updated_at
};

emitToRuntime('integration.ci', mplpEvent);
```

## 7. Event Routing & Processing

### 7.1 L3 Runtime Event Handling

**Pseudocode**:
```typescript
eventBus.on('integration.file_update', async (event: FileUpdateEvent) => {
  // 1. Validate against schema
  const valid = validateFileUpdateEvent(event);
  if (!valid) {
    logError("Invalid file update event", event);
    return;
  }

  // 2. Check for drift
  const psgNode = await psg.getNodeByPath(event.file_path);
  if (psgNode && psgNode.timestamp < event.timestamp) {
    await driftDetection.handleFileDrift(event, psgNode);
  }

  // 3. Update PSG
  await psg.updateFileMetadata(event.file_path, {
    last_modified: event.timestamp,
    content_hash: event.content_hash
  });

  // 4. Emit graph_update event
  await eventBus.emit('observability.graph_update', {
    event_id: uuid(),
    event_family: 'graph_update',
    update_kind: 'node_update',
    graph_id: psg.id,
    timestamp: new Date().toISOString()
  });
});
```

### 7.2 Event Prioritization

**Recommended Priority Levels**:
1. **High**: CI failures (block Plan completion)
2. **Medium**: Git merges (trigger reconciliation)
3. **Low**: File updates (informational)
4. **Background**: Tool invocations (metrics only)

## 8. Security & Validation

### 8.1 Source Authentication

**Requirement**: Integration events MUST identify their source

**Validation**:
```typescript
interface IntegrationEventBase {
  source: string;  // e.g., "vscode-plugin-v1.2.3", "github-webhook"
  signature?: string; // Optional HMAC for webhook verification
}
```

### 8.2 Schema Validation

**Requirement**: ALL integration events MUST validate against schemas

**Validation Libraries**:
- TypeScript: AJV v8.12.0
- Python: Pydantic v2.0+

### 8.3 Rate Limiting

**Recommendation**: Prevent event flooding

**Example**:
```typescript
const rateLimiter = new RateLimiter({
  maxEventsPerSecond: 100,
  maxEventsPerMinute: 5000
});

eventBus.on('integration.*', (event) => {
  if (!rateLimiter.allow(event.source)) {
    logWarning(`Rate limit exceeded for ${event.source}`);
    return;
  }
  processEvent(event);
});
```

## 9. L4 Compliance Checklist

IF L4 integration is implemented, it MUST:

| Requirement | Verification Method |
|:---|:---|
| **Validate Against Schemas** | JSON Schema validation (AJV/Pydantic) |
| **Include Source Identifier** | Check `source` field presence in events |
| **Use ISO 8601 Timestamps** | Timestamp format validation |
| **Emit to L3 Event Bus** | Event routing tests |
| **Handle Backpressure** | Rate limiting, queue depth monitoring |

**Optional but Recommended**:
- Webhook signature verification (for Git/CI)
- Event deduplication (avoid processing same event twice)
- Retry logic (for transient failures)

## 10. Implementation Patterns

### 10.1 Polling vs. Webhooks

**Polling** (active):
- Adapter periodically queries external system
- Pros: Simple, no infrastructure changes
- Cons: Higher latency, resource overhead

**Webhooks** (passive):
- External system pushes events to adapter
- Pros: Real-time, efficient
- Cons: Requires public endpoint, security considerations

**Recommendation**: Use webhooks for Git/CI, polling for IDE (local file watching)

### 10.2 Adapter Deployment

**Embedded**:
- Adapter runs inside L3 runtime process
- Pros: Low latency, simple deployment
- Cons: Tight coupling, security risks

**Sidecar**:
- Adapter runs as separate process/container
- Pros: Isolation, independent scaling
- Cons: Network overhead

**Example**:
```yaml
# Docker Compose
services:
  mplp-runtime:
    image: mplp/runtime:1.0.0
  git-adapter:
    image: mplp/git-adapter:1.0.0
    environment:
      - MPLP_RUNTIME_URL=http://mplp-runtime:8080
```

## 11. Relationship to L1, L2, L3

| Layer | Responsibility | L4 Role |
|:---|:---|:---|
| **L1** | Define integration event schemas | L4 events MUST validate against L1 schemas |
| **L2** | Define module lifecycles | L4 events trigger L2 state transitions (e.g., Git merge Plan re-approval) |
| **L3** | Process events, update PSG | L3 consumes L4 events, updates PSG, emits graph_update |

**Layering Rule**: L4 is **above** L3t feeds data TO the runtime but doesn't control it

## 12. Related Documents

**Architecture**:
- [Architecture Overview](index.mdx)
- [L1 Core Protocol](l1-core-protocol.md)
- [L3 Execution & Orchestration](l3-execution-orchestration.md)

**Integration Details**:
- [07-integration/integration-spec.md](../integration/integration-spec.md)

**Invariants**:
- `schemas/v2/invariants/integration-invariants.yaml` (19 rules)

**Schemas**:
- `schemas/v2/integration/mplp-file-update-event.schema.json` (2,132 bytes)
- `schemas/v2/integration/mplp-git-event.schema.json` (2,575 bytes, 6 event kinds)
- `schemas/v2/integration/mplp-ci-event.schema.json` (3,277 bytes, 5 status values)
- `schemas/v2/integration/mplp-tool-event.schema.json` (2,393 bytes, 5 tool kinds)

---

**Integration Categories**: 4 (IDE, Git, CI, Tool)  
**Event Schemas**: 4 (file_update, git, ci, tool)  
**Invariant Rules**: 19 (5 tool + 3 file + 5 git + 6 CI)  
**Event Flow**: External Systems Adapters L3 Event Bus PSG Updates