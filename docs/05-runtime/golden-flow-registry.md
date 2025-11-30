# Golden Flow Registry (25 Flows)

**Status**: Normative Registry for MPLP v1.0 Conformance

## Introduction

The **Golden Test Suite** is the definitive compatibility certification standard for MPLP v1.0. It defines a set of 25 canonical flows that cover happy paths, error scenarios, collaboration patterns, and governance enforcement. Any runtime implementation must pass these flows to be considered MPLP-compliant.

## Flow Overview

| ID | Name | Core Modules | Category |
|----|------|--------------|----------|
| **FLOW-01** | Single Agent – Basic Planning | Context, Plan | Happy Path |
| **FLOW-02** | Single Agent – Risk Confirmation | Plan, Confirm | Happy Path |
| **FLOW-03** | Single Agent – Trace Recording | Trace | Happy Path |
| **FLOW-04** | Context – Minimal Bootstrap | Context | Happy Path |
| **FLOW-05** | Context – Full Governance Profile | Context | Governance |
| **FLOW-06** | Plan – Multi-Step Execution | Plan | Happy Path |
| **FLOW-07** | Plan – Constraints & Dependencies | Plan | Happy Path |
| **FLOW-08** | Plan – Invalid Missing Required Fields | Plan | Error Path |
| **FLOW-09** | Plan – Invalid UUID Pattern | Plan | Error Path |
| **FLOW-10** | Confirm – Approved Path | Confirm | Happy Path |
| **FLOW-11** | Confirm – Rejected Path | Confirm | Happy Path |
| **FLOW-12** | Trace – Basic Event Stream | Trace | Happy Path |
| **FLOW-13** | Trace – Nested Spans & Causality | Trace | Happy Path |
| **FLOW-14** | End-to-End – Context → Plan → Confirm → Trace | All | E2E |
| **FLOW-15** | Runtime – Error Recovery & Retry | Runtime | Resilience |
| **FLOW-16** | Runtime – Invalid Context (Schema Error) | Context | Error Path |
| **FLOW-17** | Runtime – Invalid Plan (Schema Error) | Plan | Error Path |
| **FLOW-18** | Runtime – Invalid Confirm (Schema Error) | Confirm | Error Path |
| **FLOW-19** | Runtime – Invalid Trace (Schema Error) | Trace | Error Path |
| **FLOW-20** | Collab – Two-Agent Planning Session | Coordination | Collaboration |
| **FLOW-21** | Dialog – Multi-Turn Conversation Bound to Context | Coordination | Dialog |
| **FLOW-22** | Role – Role Switching & Escalation | Coordination | Governance |
| **FLOW-23** | Extension – Custom Fields & Vendor Metadata | Common | Extension |
| **FLOW-24** | Network – Message Delivery & Correlation IDs | Network | Infrastructure |
| **FLOW-25** | Governance – Minimal Policy Enforcement | Governance | Governance |

---

## FLOW-01 – Single Agent – Basic Planning

**Purpose**  
Verify minimal Context → Plan consistency.

**Core Modules**  
- Context
- Plan

**Mandatory Inputs**  
- Minimal `Context` object
- `Plan` with at least 1 step

**Expected Outputs**  
- Valid `Plan` object passing schema v2 validation

**Invariants**  
- `plan.context_id == context.context_id`
- `plan.steps[*].status == "pending"`

**Expected Events**  
- `plan.created`

**Breaking Rule Triggers**  
- Missing `plan_id`
- Missing required fields in any `steps[*]`

---

## FLOW-02 – Single Agent – Risk Confirmation

**Purpose**  
Verify Plan → Confirm transition for risk assessment.

**Core Modules**  
- Plan
- Confirm

**Mandatory Inputs**  
- Valid `Plan`
- `Confirm` request targeting the plan

**Expected Outputs**  
- Valid `Confirm` object

**Invariants**  
- `confirm.target_id == plan.plan_id`
- `confirm.target_type == "plan"`

**Expected Events**  
- `confirm.created`

**Breaking Rule Triggers**  
- `target_id` mismatch

---

## FLOW-03 – Single Agent – Trace Recording

**Purpose**  
Verify execution tracing of a confirmed plan.

**Core Modules**  
- Trace

**Mandatory Inputs**  
- Context, Plan, Confirm
- Execution results

**Expected Outputs**  
- Valid `Trace` object with spans

**Invariants**  
- `trace.plan_id == plan.plan_id`
- `trace.root_span.trace_id == trace.trace_id`

**Expected Events**  
- `trace.started`
- `trace.finalized`

**Breaking Rule Triggers**  
- Missing `root_span`

---

## FLOW-04 – Context – Minimal Bootstrap

**Purpose**  
Validate the absolute minimum valid Context object.

**Core Modules**  
- Context

**Mandatory Inputs**  
- `title`, `root` (domain/env)

**Expected Outputs**  
- Valid `Context`

**Invariants**  
- `context_id` is UUIDv4
- `meta.protocol_version` is present

**Expected Events**  
- `context.initialized`

**Breaking Rule Triggers**  
- Missing `root` object

---

## FLOW-05 – Context – Full Governance Profile

**Purpose**  
Validate Context with all optional governance fields (owner, constraints, policies).

**Core Modules**  
- Context

**Mandatory Inputs**  
- `owner_role`, `constraints`, `policies`

**Expected Outputs**  
- Valid `Context` with governance fields

**Invariants**  
- `constraints` is object
- `owner_role` is string

**Expected Events**  
- `context.initialized`

**Breaking Rule Triggers**  
- Invalid type for `constraints`

---

## FLOW-06 – Plan – Multi-Step Execution

**Purpose**  
Validate Plan with multiple sequential steps.

**Core Modules**  
- Plan

**Mandatory Inputs**  
- `steps` array with >1 items

**Expected Outputs**  
- Valid `Plan`

**Invariants**  
- `steps` length > 1
- All `step_id`s are unique

**Expected Events**  
- `plan.created`

**Breaking Rule Triggers**  
- Duplicate `step_id`

---

## FLOW-07 – Plan – Constraints & Dependencies

**Purpose**  
Validate Plan steps with dependencies (DAG structure).

**Core Modules**  
- Plan

**Mandatory Inputs**  
- Steps with `dependencies` field

**Expected Outputs**  
- Valid `Plan`

**Invariants**  
- Referenced dependency IDs must exist in `steps`

**Expected Events**  
- `plan.created`

**Breaking Rule Triggers**  
- Dependency ID not found

---

## FLOW-08 – Plan – Invalid Missing Required Fields (Error)

**Purpose**  
Verify validator catches missing required fields in Plan.

**Core Modules**  
- Plan

**Mandatory Inputs**  
- Plan missing `title` or `steps`

**Expected Outputs**  
- Validation Error (Schema)

**Invariants**  
- Validator returns `ok: false`
- Error code `required`

**Expected Events**  
- None (or Error Event)

**Breaking Rule Triggers**  
- N/A (This IS the breaking trigger)

---

## FLOW-09 – Plan – Invalid UUID Pattern (Error)

**Purpose**  
Verify validator catches invalid UUID formats.

**Core Modules**  
- Plan

**Mandatory Inputs**  
- Plan with malformed `plan_id` (e.g., "123")

**Expected Outputs**  
- Validation Error (Schema)

**Invariants**  
- Validator returns `ok: false`
- Error code `pattern`

**Expected Events**  
- None

**Breaking Rule Triggers**  
- N/A

---

## FLOW-10 – Confirm – Approved Path

**Purpose**  
Verify explicit approval workflow.

**Core Modules**  
- Confirm

**Mandatory Inputs**  
- `status: "approved"`

**Expected Outputs**  
- Valid `Confirm`

**Invariants**  
- `status == "approved"`

**Expected Events**  
- `confirm.approved`

**Breaking Rule Triggers**  
- Invalid status enum

---

## FLOW-11 – Confirm – Rejected Path

**Purpose**  
Verify rejection workflow with reason.

**Core Modules**  
- Confirm

**Mandatory Inputs**  
- `status: "rejected"`
- `reason` string

**Expected Outputs**  
- Valid `Confirm`

**Invariants**  
- `status == "rejected"`
- `reason` is present

**Expected Events**  
- `confirm.rejected`

**Breaking Rule Triggers**  
- Missing `reason` when rejected

---

## FLOW-12 – Trace – Basic Event Stream

**Purpose**  
Verify basic event logging in Trace.

**Core Modules**  
- Trace

**Mandatory Inputs**  
- `events` array

**Expected Outputs**  
- Valid `Trace`

**Invariants**  
- `events` is array

**Expected Events**  
- `trace.updated`

**Breaking Rule Triggers**  
- Events not an array

---

## FLOW-13 – Trace – Nested Spans & Causality

**Purpose**  
Verify hierarchical span structure.

**Core Modules**  
- Trace

**Mandatory Inputs**  
- Spans with `parent_span_id`

**Expected Outputs**  
- Valid `Trace`

**Invariants**  
- Child span `parent_span_id` exists

**Expected Events**  
- `span.started`, `span.ended`

**Breaking Rule Triggers**  
- Orphaned spans (logic error, though schema might permit)

---

## FLOW-14 – End-to-End – Context → Plan → Confirm → Trace

**Purpose**  
Verify the complete happy-path lifecycle.

**Core Modules**  
- All

**Mandatory Inputs**  
- Full sequence inputs

**Expected Outputs**  
- All 4 valid objects linked by IDs

**Invariants**  
- Full ID chain integrity

**Expected Events**  
- Full sequence of lifecycle events

**Breaking Rule Triggers**  
- ID mismatch across stages

---

## FLOW-15 – Runtime – Error Recovery & Retry

**Purpose**  
Verify runtime handling of transient failures.

**Core Modules**  
- Runtime

**Mandatory Inputs**  
- Module that fails once then succeeds

**Expected Outputs**  
- Final success result
- Trace showing failure then retry

**Invariants**  
- Trace contains error event and recovery

**Expected Events**  
- `runtime.error`, `runtime.retry`

**Breaking Rule Triggers**  
- Uncaught exception

---

## FLOW-16 – Runtime – Invalid Context (Schema Error)

**Purpose**  
Verify runtime rejects invalid Context input.

**Core Modules**  
- Context

**Mandatory Inputs**  
- Invalid Context JSON

**Expected Outputs**  
- Runtime Error / Validation Failure

**Invariants**  
- Execution halted or rejected

**Expected Events**  
- `runtime.error`

**Breaking Rule Triggers**  
- N/A

---

## FLOW-17 – Runtime – Invalid Plan (Schema Error)

**Purpose**  
Verify runtime rejects invalid Plan generation.

**Core Modules**  
- Plan

**Mandatory Inputs**  
- Module producing invalid Plan

**Expected Outputs**  
- Runtime Error

**Invariants**  
- Execution halted

**Expected Events**  
- `runtime.error`

**Breaking Rule Triggers**  
- N/A

---

## FLOW-18 – Runtime – Invalid Confirm (Schema Error)

**Purpose**  
Verify runtime rejects invalid Confirm.

**Core Modules**  
- Confirm

**Mandatory Inputs**  
- Invalid Confirm

**Expected Outputs**  
- Runtime Error

**Invariants**  
- Execution halted

**Expected Events**  
- `runtime.error`

**Breaking Rule Triggers**  
- N/A

---

## FLOW-19 – Runtime – Invalid Trace (Schema Error)

**Purpose**  
Verify runtime handles invalid Trace data.

**Core Modules**  
- Trace

**Mandatory Inputs**  
- Invalid Trace update

**Expected Outputs**  
- Runtime Error

**Invariants**  
- Error reported

**Expected Events**  
- `runtime.error`

**Breaking Rule Triggers**  
- N/A

---

## FLOW-20 – Collab – Two-Agent Planning Session

**Purpose**  
Verify multi-agent coordination (Agent A plans, Agent B reviews).

**Core Modules**  
- Coordination

**Mandatory Inputs**  
- Two participant IDs

**Expected Outputs**  
- Plan with `author_role` / `reviewer_role`

**Invariants**  
- Multiple participants in metadata

**Expected Events**  
- `agent.handoff`

**Breaking Rule Triggers**  
- Permission denial

---

## FLOW-21 – Dialog – Multi-Turn Conversation Bound to Context

**Purpose**  
Verify dialog messages linked to a Context.

**Core Modules**  
- Coordination

**Mandatory Inputs**  
- Series of messages

**Expected Outputs**  
- Trace containing message events

**Invariants**  
- Messages linked to `context_id`

**Expected Events**  
- `message.sent`, `message.received`

**Breaking Rule Triggers**  
- Message without context

---

## FLOW-22 – Role – Role Switching & Escalation

**Purpose**  
Verify dynamic role changes.

**Core Modules**  
- Coordination

**Mandatory Inputs**  
- Role change request

**Expected Outputs**  
- Updated Context/Participant state

**Invariants**  
- Role updated in state

**Expected Events**  
- `role.changed`

**Breaking Rule Triggers**  
- Unauthorized escalation

---

## FLOW-23 – Extension – Custom Fields & Vendor Metadata

**Purpose**  
Verify `additionalProperties` handling in `meta`.

**Core Modules**  
- Common

**Mandatory Inputs**  
- `meta` with `x-vendor-data`

**Expected Outputs**  
- Valid object preserving custom data

**Invariants**  
- Custom data persisted

**Expected Events**  
- N/A

**Breaking Rule Triggers**  
- Validation error if `additionalProperties: false` (should be true for meta)

---

## FLOW-24 – Network – Message Delivery & Correlation IDs

**Purpose**  
Verify message correlation across boundaries.

**Core Modules**  
- Network

**Mandatory Inputs**  
- Message with `correlation_id`

**Expected Outputs**  
- Response with same `correlation_id`

**Invariants**  
- IDs match

**Expected Events**  
- `network.packet`

**Breaking Rule Triggers**  
- Lost correlation

---

## FLOW-25 – Governance – Minimal Policy Enforcement

**Purpose**  
Verify basic policy check (e.g., "no-execute" flag).

**Core Modules**  
- Governance

**Mandatory Inputs**  
- Context with policy

**Expected Outputs**  
- Execution blocked or allowed based on policy

**Invariants**  
- Policy respected

**Expected Events**  
- `policy.enforced`

**Breaking Rule Triggers**  
- Policy violation ignored
