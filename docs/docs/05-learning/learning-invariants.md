---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: Learning Invariants
---

# Learning Invariants

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 3. Intent Resolution Family Invariants

These invariants apply **only when `sample_family == "intent_resolution"`**.

| Invariant ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `learning_intent_has_intent_id` | `learning_sample` | `input.intent_id` | `non-empty-string` | Intent resolution samples must have intent_id in input |
| `learning_intent_quality_label_valid` | `learning_sample` | `output.resolution_quality_label` | `enum(good,acceptable,bad,unknown)` | If present, quality label must be valid enum |

## 5. Invariant Application Logic

### 5.1 Conditional Application

Some invariants are **conditional** based on:
- **Field existence**: Applied only when the field is present
- **Sample family**: Applied only for specific `sample_family` values

```yaml

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

**End of Learning Invariants Reference**