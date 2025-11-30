# Golden Fixture Format

**Status**: Normative Specification for MPLP v1.0 Conformance

## 1. Directory Structure

The Golden Test Suite is organized by Flow ID in the `tests/golden/flows/` directory. Each flow has a dedicated subdirectory containing input and expected output fixtures.

```txt
/tests/golden/flows/
    flow-01-single-agent-plan/
        input/
            context.json       # Optional (if flow requires specific context)
            plan.json          # Optional
            confirm.json       # Optional
            trace.json         # Optional
        expected/
            context.json       # Required: The "Golden" Context state
            plan.json          # Required: The "Golden" Plan state
            confirm.json       # Required: The "Golden" Confirm state
            trace.json         # Required: The "Golden" Trace state
            events.json        # Required: Ordered list of emitted events
            invariants.yaml    # Optional: Flow-specific invariant rules
```

## 2. Input Format (`input/`)

The `input/` directory contains the starting state or parameters for the flow.

- **Purpose**: To provide deterministic inputs for the runtime execution.
- **Rules**:
    - If a file is missing (e.g., `context.json`), the test runner MUST generate a valid default object using the SDK builders or Runtime defaults.
    - If a file is present, the test runner MUST use it as the specific input for that stage.

## 3. Output Format (`expected/`)

The `expected/` directory contains the authoritative "Golden" output that a compliant runtime MUST produce.

### 3.1 Protocol Objects
- `context.json`, `plan.json`, `confirm.json`, `trace.json`
- These represent the final state of the objects after the flow completes.

### 3.2 Events (`events.json`)
- An array of `MplpEvent` objects.
- Represents the exact sequence of events emitted during execution.

### 3.3 Invariants (`invariants.yaml`)
- A list of additional assertions to verify relationships that cannot be captured by static JSON comparison (e.g., "timestamp A must be after timestamp B").

## 4. Comparison Rules

To verify conformance, the Runtime's actual output is compared against the `expected/` fixtures using the following strict rules:

### 4.1 Object Comparison
- **Deep Equality**: JSON objects are compared key-by-key.
- **Missing Keys**: If a key exists in `expected` but is missing in `actual`, it is a **FAILURE**.
- **Extra Keys**: If `actual` contains keys not in `expected`, it is **ALLOWED** (open-world assumption), UNLESS `additionalProperties: false` is enforced by schema.
- **Values**: Primitive values (string, number, boolean) must match exactly.

### 4.2 Array Comparison
- **Strict Ordering**: Arrays are compared item-bi-item in order.
- **Length**: Array lengths must match exactly.

### 4.3 Ignored Fields
The following fields are **EXCLUDED** from direct value comparison because they are non-deterministic (auto-generated):

- **IDs**: `context_id`, `plan_id`, `confirm_id`, `trace_id`, `step_id`, `span_id`, `target_id` (unless specifically fixed in input).
- **Timestamps**: `created_at`, `updated_at`, `requested_at`, `started_at`, `finished_at`, `timestamp`.
- **Runtime Metadata**: `run_id`, `correlation_id` (if dynamic).

*Note: While the VALUES are ignored during JSON comparison, their FORMAT and REFERENTIAL INTEGRITY are verified by the Invariant Checker.*

### 4.4 Trace Events
- **Type Matching**: `event.type` must match exactly.
- **Payload Matching**: `event.data` is compared using the Object Comparison rules above.
- **Sequence**: The order of events must match `events.json`.

## 5. Relationship to Standards

- **Schema Mapping**: This format validates that the Runtime produces objects that conform to the [Schema Mapping Standard](../06-sdk/schema-mapping-standard.md).
- **Integration Patterns**: This suite verifies that the [Integration Patterns](../05-runtime/integration-patterns.md) are implemented correctly to produce standard-compliant behavior.
