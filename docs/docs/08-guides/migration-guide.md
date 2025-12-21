
# Migration Guide (v0.x -> v1.0)

## 1. Purpose

This guide assists developers in migrating from pre-release versions (v0.x) of MPLP to the frozen v1.0 standard.

## 2. Breaking Changes

### 2.1 Schema Standardization
*   **Change**: All schemas now use `snake_case` for field names.
*   **Action**: Update your JSON payloads.
    *   `planID` -> `plan_id`
    *   `contextID` -> `context_id`

### 2.2 Module Consolidation
*   **Change**: The `Memory` module has been merged into `Context` and `Trace`.
*   **Action**: Move persistent memory to Context state and ephemeral memory to Trace attributes.

### 2.3 Event Taxonomy
*   **Change**: Events are now strictly typed into 12 families.
*   **Action**: Map your custom events to one of the 12 normative families.

## 3. Migration Steps

1.  **Upgrade SDK**: Install `@mplp/sdk-ts@1.0.0`.
2.  **Validate Data**: Run your existing JSON files against the v2 schemas.
3.  **Update Code**: Refactor your agent logic to use the new Module interfaces.
4.  **Verify**: Run the Compliance Test Suite.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
