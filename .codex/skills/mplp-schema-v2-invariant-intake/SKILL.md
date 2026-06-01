---
name: mplp-schema-v2-invariant-intake
description: Use for MPLP schemas/v2 primitive intake, invariants, negative fixtures, object schemas, profiles, conformance manifests, and validator gates.
---

# MPLP Schema v2 Invariant Intake

This skill governs schemas/v2 work.

## Hard Order

Codex must follow this order:

1. Inspect existing schemas/v2 assets.
2. Inspect existing validators and fixtures.
3. Define or update invariants.
4. Add negative fixtures bound to invariant IDs.
5. Add kernel object schemas.
6. Add positive fixtures.
7. Add validator tests.
8. Update conformance manifest or inventory.
9. Update governance record only if necessary.

## Required Principle

Invariant -> Negative Fixture -> Object Schema -> Positive Fixture -> Validator -> Governance Record

## v1.0 Frozen Boundary

v1.0 module schemas may reference v2 objects only through pointer-only refs.

Allowed:

```yaml
active_context_version_ref:
  ref_id: "ctxv-..."
  ref_type: "ActiveContextVersion"
  protocol_version: "2.0.0"
  schema_version: "2.x"
  profile_marker: "required"
```

Forbidden:

```yaml
active_context_version:
  context_id: "..."
  validity_state: "active"
  superseded_by: "..."
```

## Forbidden Imports Into Protocol Core

Do not add these to MPLP protocol core:

- RCCS-M
- ALCS
- AARM
- audit score
- insurance score
- procurement score
- certification
- legal compliance proof
- regulator approval
- vendor ranking
- SoloCrew UI objects
- Cognitive OS runtime internals
- Coregentis commercial validation service language

## Required Output

For every schema primitive, report:

```yaml
primitive:
  name:
  module_mapping:
  invariant_mapping:
  positive_fixture:
  negative_fixture:
  validator_rule:
  conformance_profile:
  v1_pointer_refs_if_any:
  files_changed:
```
