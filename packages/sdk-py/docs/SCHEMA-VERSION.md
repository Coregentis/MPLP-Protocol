# MPLP Protocol Schema Versioning

- Protocol Version: **v1.0.0 (FROZEN)**
- Freeze Date: 2025-12-03
- Governance: MPLP Protocol Governance Committee (MPGC)
- Schema Source of Truth: `schemas/v2`

## Artifact Version Matrix (Schema Perspective)

| Artifact                   | Version | Notes                              |
|----------------------------|---------|------------------------------------|
| MPLP Core Schemas (L1/L2)  | 1.0.0   | Frozen, governed by MPGC          |
| Invariants (Observability) | 1.0.0   | Frozen, YAML headers applied      |
| TS SDK Schema Binding      | 1.0.0   | Generated from schemas/v2         |
| Python SDK Schema Binding  | 1.0.0   | Generated from schemas/v2 (Pydantic) |