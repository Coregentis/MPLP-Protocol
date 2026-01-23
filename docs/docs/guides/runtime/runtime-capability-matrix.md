---

title: Runtime Capability Matrix
sidebar_label: Capability Matrix
sidebar_position: 2
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance

description: "MPLP runtime guide: Runtime Capability Matrix. Implementation guidance for runtime components."
---


# Runtime Capability → Schema Matrix

This matrix defines the **MUST Schema** obligations for the **Profile-14-Golden** Runtime.

| Capability Group | Capability ID | Description | MUST Schema | Evidence Artifact |
|---|---|---|---|---|
| **A. Core** | A1 | Run Identity | `common/identifiers.schema.json` | `execution.ndjson` |
| | A2 | Execution Timeline | `events/mplp-runtime-execution-event.schema.json` | `execution.ndjson` |
| | A3 | Trace Base | `common/trace-base.schema.json` | `trace.json` |
| **D. Tools** | D1/D2 | Tool Invocation | `integration/mplp-tool-event.schema.json` | `tool-events.ndjson` |
| **E. Files** | E1/E2 | File Update | `integration/mplp-file-update-event.schema.json` | `fs-events.ndjson` |
| **H. Profiles** | H1 | SA Events | `events/mplp-sa-event.schema.json` | `sa-events.ndjson` |
| | H2 | MAP Events | `events/mplp-map-event.schema.json` | `map-events.ndjson` |
| **J. Invariants** | J1 | Observability Evidence | `invariants/observability-invariants.yaml` | (All above) |
| | J2 | Integration Evidence | `invariants/integration-invariants.yaml` | (All above) |

## Evidence Responsibility

The Runtime is responsible for **generating** these artifacts linked to a specific `run_id`.
The Runtime is **NOT** responsible for evaluating whether these artifacts satisfy the Invariants.
