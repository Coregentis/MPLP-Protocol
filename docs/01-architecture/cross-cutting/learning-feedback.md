> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# 1. Purpose
The Learning & Feedback Specification defines the normative mechanisms for capturing high-value interaction data to improve agent performance. It standardizes the format of "Learning Samples".

# 2. Normative Scope
This specification applies to:
- **L2 Coordination & Governance**: `Plan`, `Confirm`, `Dialog` (primary sources of feedback).
- **L3 Runtime**: Collection and storage logic.

# 3. Responsibilities (SHALL / MUST)
1.  The Runtime **SHOULD** capture `LearningSample` objects at defined "Collection Points".
2.  A `LearningSample` **MUST** conform to the `schemas/v2/learning/` schemas.
3.  Samples **MUST** include: `input` (Context), `output` (Action/Plan), and `feedback` (Correction/Score).
4.  The Runtime **MUST** anonymize PII in samples if configured to do so.
5.  Collection **MUST NOT** block the critical execution path (async processing).
6.  The system **MUST** support "Implicit Feedback" (e.g., user accepts a plan = positive signal).
7.  The system **MUST** support "Explicit Feedback" (e.g., user edits a plan = correction signal).
8.  Samples **SHALL** be persisted to a dedicated storage area (e.g., `psg.learning_samples` or external dataset).

# 4. Cross-module Bindings
- **Plan Module**: Source of `IntentEvent` and `DeltaIntentEvent` (Correction).
- **Confirm Module**: Source of approval/rejection signals.
- **Dialog Module**: Source of natural language feedback.

# 5. Event Obligations
- **RECOMMENDED**: `IntentEvent` (User goal).
- **RECOMMENDED**: `DeltaIntentEvent` (User correction).
- **OPTIONAL**: `ReasoningGraphEvent` (Chain of thought).

# 6. PSG Bindings (Runtime Touchpoints)
- **SHOULD write to**: `psg.learning_samples`.
- **MUST read from**: `psg.pipeline_state` (to correlate input/output).

# 7. Invariants
- **learning_sample_structure**: Must have input and output.
- **feedback_attribution**: Feedback must be attributed to a source (User/System).

# 8. Governance Considerations
- **Data Privacy**: Learning samples often contain sensitive user intent. Strict governance is required.
- **Optionality**: Learning is a "Value Add" feature, not a functional requirement for v1.0 execution.

# 9. Examples (Optional)
**Correction Sample**:
- **Input**: "Book a flight to NY"
- **Output**: "Booking flight to Newark"
- **Feedback**: "No, to JFK"
- **Delta**: Constraint `airport=JFK` added.

# 10. Change Log
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
