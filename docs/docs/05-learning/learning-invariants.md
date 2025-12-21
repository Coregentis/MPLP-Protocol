---
title: Learning Invariants
description: Normative invariants for MPLP Learning Samples. Defines validation rules for sample structure, required fields, and family-specific constraints to ensure data quality.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Learning Invariants, sample validation, learning data quality, normative rules, sample structure, MPLP invariants, learning schema validation]
sidebar_label: Learning Invariants
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Learning Invariants Reference

## 1. Purpose

This document provides the **normative reference** for all Learning Sample validation invariants defined in `schemas/v2/invariants/learning-invariants.yaml`.

Invariants are validation rules that MUST be enforced when processing LearningSample objects.

---

## 2. Core LearningSample Invariants

These invariants apply to **all LearningSample objects** regardless of family.

### 2.1 Identifier Invariants

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_sample_id_is_uuid` | `learning_sample` | `sample_id` | `uuid-v4` | All LearningSamples must have UUID v4 sample_id |
| `learning_sample_family_non_empty` | `learning_sample` | `sample_family` | `non-empty-string` | LearningSample must have non-empty sample_family |
| `learning_sample_created_at_iso` | `learning_sample` | `created_at` | `iso-datetime` | created_at must be ISO 8601 timestamp |

### 2.2 Required Section Invariants

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_sample_has_input_section` | `learning_sample` | `input` | `exists` | LearningSample must have input section |
| `learning_sample_has_output_section` | `learning_sample` | `output` | `exists` | LearningSample must have output section |

### 2.3 Meta Field Invariants (Conditional)

These invariants apply **only when the field is present**.

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_sample_feedback_label_valid` | `learning_sample` | `meta.human_feedback_label` | `enum(approved,rejected,not_reviewed)` | If present, must be valid enum |
| `learning_sample_source_flow_non_empty` | `learning_sample` | `meta.source_flow_id` | `non-empty-string` | If present, must be non-empty |

---

## 3. Intent Resolution Family Invariants

These invariants apply **only when `sample_family == "intent_resolution"`**.

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_intent_has_intent_id` | `learning_sample` | `input.intent_id` | `non-empty-string` | Intent resolution samples must have intent_id in input |
| `learning_intent_quality_label_valid` | `learning_sample` | `output.resolution_quality_label` | `enum(good,acceptable,bad,unknown)` | If present, quality label must be valid enum |

---

## 4. Delta Impact Family Invariants

These invariants apply **only when `sample_family == "delta_impact"`**.

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_delta_has_delta_id` | `learning_sample` | `input.delta_id` | `non-empty-string` | Delta impact samples must have delta_id in input |
| `learning_delta_scope_valid` | `learning_sample` | `output.impact_scope` | `enum(local,module,system,global)` | Impact scope must be valid enum |
| `learning_delta_risk_valid` | `learning_sample` | `state.risk_level` | `enum(low,medium,high,critical)` | If present, risk level must be valid enum |

---

## 5. Invariant Application Logic

### 5.1 Conditional Application

Some invariants are **conditional** based on:
- **Field existence**: Applied only when the field is present
- **Sample family**: Applied only for specific `sample_family` values

```yaml
# Example from learning-invariants.yaml
- id: learning_intent_has_intent_id
  scope: learning_sample
  path: input.intent_id
  rule: non-empty-string
  description: "Intent resolution samples must have intent_id in input"
  note: "Apply when sample_family == intent_resolution"
```

### 5.2 Implementation Notes

From the invariants file:

> If the invariant engine does not support conditional application, these should be enforced at the schema level (already done in family-specific schemas) or during runtime validation. These invariants provide an additional validation layer.

---

## 6. Rule Types

| Rule Type | Description | Example |
|:---|:---|:---|
| `uuid-v4` | Must be a valid UUID version 4 | `550e8400-e29b-41d4-a716-446655440000` |
| `non-empty-string` | Must be a non-empty string | `"my-value"` |
| `iso-datetime` | Must be ISO 8601 date-time | `2025-12-03T10:00:00Z` |
| `exists` | Field must exist (not null/undefined) | `{}` is valid, `null` is not |
| `enum(...)` | Must be one of the specified values | `enum(low,medium,high)` |

---

## 7. Validation Example

```python
def validate_learning_sample(sample: dict) -> list[str]:
    """
    Validate a LearningSample against invariants.
    Returns list of violation messages.
    """
    violations = []
    
    # Core invariants
    if not is_uuid_v4(sample.get('sample_id')):
        violations.append("learning_sample_id_is_uuid: sample_id must be UUID v4")
    
    if not sample.get('sample_family'):
        violations.append("learning_sample_family_non_empty: sample_family required")
    
    if not is_iso_datetime(sample.get('created_at')):
        violations.append("learning_sample_created_at_iso: created_at must be ISO 8601")
    
    if 'input' not in sample:
        violations.append("learning_sample_has_input_section: input required")
    
    if 'output' not in sample:
        violations.append("learning_sample_has_output_section: output required")
    
    # Conditional: Meta field validation
    if sample.get('meta', {}).get('human_feedback_label'):
        if sample['meta']['human_feedback_label'] not in ['approved', 'rejected', 'not_reviewed']:
            violations.append("learning_sample_feedback_label_valid: invalid enum")
    
    # Family-specific: intent_resolution
    if sample.get('sample_family') == 'intent_resolution':
        if not sample.get('input', {}).get('intent_id'):
            violations.append("learning_intent_has_intent_id: intent_id required")
    
    # Family-specific: delta_impact
    if sample.get('sample_family') == 'delta_impact':
        if not sample.get('input', {}).get('delta_id'):
            violations.append("learning_delta_has_delta_id: delta_id required")
        
        impact_scope = sample.get('output', {}).get('impact_scope')
        if impact_scope and impact_scope not in ['local', 'module', 'system', 'global']:
            violations.append("learning_delta_scope_valid: invalid impact_scope")
    
    return violations
```

---

## 8. References

- **Source File**: `schemas/v2/invariants/learning-invariants.yaml`
- **Core Schema**: `schemas/v2/learning/mplp-learning-sample-core.schema.json`
- **Learning Overview**: [learning-overview.md](learning-overview.md)
- **Sample Schema Reference**: [learning-sample-schema.md](learning-sample-schema.md)

---

**End of Learning Invariants Reference**
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
