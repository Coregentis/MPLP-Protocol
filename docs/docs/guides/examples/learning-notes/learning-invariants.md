---
sidebar_position: 4

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Validation rules for LearningSamples, covering core and family-specific invariants."
title: Learning Invariants

---


# Learning Invariants


## 1. Purpose

Learning invariants define **validation rules** that LearningSamples must satisfy. These rules ensure structural integrity, enable interoperability, and support quality assessment.

**Source of Truth**: `schemas/v2/invariants/learning-invariants.yaml`

## 2. Core Invariants

These invariants apply to **all** LearningSamples regardless of family.

| Invariant ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `learning_sample_id_is_uuid` | `sample_id` | `uuid-v4` | Sample ID must be UUID v4 format |
| `learning_sample_family_non_empty` | `sample_family` | `non-empty-string` | Sample family is required |
| `learning_sample_created_at_iso` | `created_at` | `iso-datetime` | Created timestamp must be ISO 8601 |
| `learning_sample_has_input_section` | `input` | `object-required` | Input section is required |
| `learning_sample_has_output_section` | `output` | `object-required` | Output section is required |
| `learning_sample_feedback_label_valid` | `meta.human_feedback_label` | `enum(approved, rejected, not_reviewed)` | If present, must be valid enum |
| `learning_sample_source_flow_non_empty` | `meta.source_flow_id` | `non-empty-string` | If present, must be non-empty |

## 3. Intent Resolution Family Invariants

These invariants apply **only when `sample_family == "intent_resolution"`**.

| Invariant ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `learning_intent_has_intent_id` | `input.intent_id` | `non-empty-string` | Intent resolution samples must have intent_id in input |
| `learning_intent_quality_label_valid` | `output.resolution_quality_label` | `enum(good, acceptable, bad, unknown)` | If present, quality label must be valid enum |

## 4. Delta Impact Family Invariants

These invariants apply **only when `sample_family == "delta_impact"`**.

| Invariant ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `learning_delta_has_delta_id` | `input.delta_id` | `non-empty-string` | Delta impact samples must have delta_id in input |
| `learning_delta_scope_valid` | `output.impact_scope` | `enum(local, module, system, global)` | Impact scope must be valid enum |
| `learning_delta_risk_valid` | `state.risk_level` | `enum(low, medium, high, critical)` | Risk level must be valid enum |

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

### 5.3 Validation Order

1. **Core invariants first**: Validate structure
2. **Family-specific invariants**: Based on `sample_family` value
3. **Optional field validation**: Only if field is present

## 6. Compliance Summary

| Category | Count | Enforcement |
|:---|:---:|:---|
| Core Invariants | 7 | Always apply |
| Intent Family | 2 | When `sample_family == intent_resolution` |
| Delta Family | 3 | When `sample_family == delta_impact` |
| **Total** | **12** | |

> [!NOTE]
> Other families (pipeline_outcome, confirm_decision, graph_evolution, multi_agent_coordination)
> use the Core Schema and rely on core invariants only.

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
        
        quality = sample.get('output', {}).get('resolution_quality_label')
        if quality and quality not in ['good', 'acceptable', 'bad', 'unknown']:
            violations.append("learning_intent_quality_label_valid: invalid enum")
    
    # Family-specific: delta_impact
    if sample.get('sample_family') == 'delta_impact':
        if not sample.get('input', {}).get('delta_id'):
            violations.append("learning_delta_has_delta_id: delta_id required")
        
        impact_scope = sample.get('output', {}).get('impact_scope')
        if impact_scope and impact_scope not in ['local', 'module', 'system', 'global']:
            violations.append("learning_delta_scope_valid: invalid impact_scope")
        
        risk_level = sample.get('state', {}).get('risk_level')
        if risk_level and risk_level not in ['low', 'medium', 'high', 'critical']:
            violations.append("learning_delta_risk_valid: invalid risk_level")
    
    return violations
```

---

**Total Invariants**: 12 (7 core + 2 intent + 3 delta)
**Validation**: Schema-level + runtime validation
**Source**: `schemas/v2/invariants/learning-invariants.yaml`