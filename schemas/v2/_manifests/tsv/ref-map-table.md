# TSV-01 Reference Map Table

**Generated**: 2026-01-04T15:08:00Z  
**Bundle Hash**: sha256:78ea3511...

---

## Summary

| Metric | Value |
|:---|:---:|
| Total $ref usages | 144 |
| Unique targets | 17 |
| External targets | 10 |
| Internal $defs | 7 |
| Orphan schemas | 0 |
| Circular deps | 0 |

---

## Dependency Hierarchy

```
Terminal (no outgoing $ref)
└── common/identifiers.schema.json

Base Schemas (referenced but minimal deps)
├── common/metadata.schema.json → identifiers
├── common/trace-base.schema.json → identifiers
├── common/events.schema.json → identifiers
├── common/common-types.schema.json (standalone #/definitions)
├── events/mplp-event-core.schema.json (standalone)
└── learning/mplp-learning-sample-core.schema.json → metadata

Consumer Schemas (10 modules)
├── mplp-context.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-plan.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-trace.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-confirm.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-role.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-dialog.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-collab.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-extension.schema.json → metadata, identifiers, trace-base, events, common-types
├── mplp-network.schema.json → metadata, identifiers, trace-base, events, common-types
└── mplp-core.schema.json → metadata, identifiers, trace-base, events, common-types
```

---

## Reference Counts by Target

| Target | Count | Consumers |
|:---|:---:|:---|
| common/identifiers.schema.json | 44 | All 10 modules + trace-base + events |
| common/events.schema.json | 21 | All 10 modules |
| common/trace-base.schema.json | 20 | All 10 modules |
| common/metadata.schema.json | 20 | All 10 modules |
| common/common-types.schema.json#/definitions/Ref | 9 | governance.lastConfirmRef |
| identifiers.schema.json (relative) | 8 | common/ internal refs |
| mplp-event-core.schema.json | 3 | graph-update, pipeline-stage, runtime-execution |
| mplp-learning-sample-core.schema.json | 2 | delta, intent |

---

## Internal $defs References

| $def | Schema | Count |
|:---|:---|:---:|
| #/$defs/trace_segment_core | mplp-trace.schema.json | 2 |
| #/$defs/plan_step_core | mplp-plan.schema.json | 2 |
| #/$defs/network_node_core | mplp-network.schema.json | 2 |
| #/$defs/dialog_message_core | mplp-dialog.schema.json | 2 |
| #/$defs/core_module_descriptor | mplp-core.schema.json | 2 |
| #/$defs/confirm_decision_core | mplp-confirm.schema.json | 2 |
| #/$defs/collab_participant_core | mplp-collab.schema.json | 2 |
| #/definitions/MplpId | common/identifiers.schema.json | 1 |

---

## Verdict: ✅ PASS

- All 144 $refs resolve to existing targets
- No circular dependencies
- No orphan schemas
- Dependency hierarchy is clean (terminal → base → consumer)
