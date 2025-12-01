---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Schema Conventions

## 1. Scope

This document defines the **normative conventions** for authoring, naming, and structuring JSON Schemas within the MPLP protocol.

**Boundaries**:
- **In Scope**: File naming, JSON Schema Draft-07 usage, field naming, documentation standards.
- **Out of Scope**: Specific schema contents (defined in L1).

## 2. Normative Definitions

- **Snake Case**: Lowercase words separated by underscores (e.g., `user_id`).
- **Kebab Case**: Lowercase words separated by hyphens (e.g., `mplp-context`).
- **Pascal Case**: Capitalized words concatenated (e.g., `ContextNode`).

## 3. Responsibilities (MUST/SHALL)

1.  **File Naming**: Schema files **MUST** follow the pattern `mplp-<module>.schema.json` (e.g., `mplp-context.schema.json`).
2.  **Field Naming**: Properties **MUST** use `snake_case`.
3.  **Type Naming**: TypeScript types derived from schemas **MUST** use `PascalCase`.
4.  **Draft Version**: Schemas **MUST** use JSON Schema Draft-07.
5.  **Descriptions**: Every field **MUST** have a `description` property.

## 4. Architecture Structure

### Directory Layout
```
schemas/v2/
├── common/                        # Shared definitions
├── events/                        # Observability events
├── integration/                   # Integration events
├── learning/                      # Learning samples
├── invariants/                    # YAML invariants
└── mplp-<module>.schema.json      # Core modules
```

## 5. Binding Points

### 5.1 L1 Binding
- These conventions govern the creation of all L1 artifacts.

### 5.2 Tool Binding
- Code generators (e.g., `json-schema-to-typescript`) rely on these conventions to produce valid code.

## 6. Interaction Model

N/A (Static Specification)

## 7. Versioning & Invariants

- **Breaking Changes**: Renaming a file or field violates these conventions and constitutes a Major version change.

## 8. Security / Safety Considerations

- **No Remote Refs**: Schemas **MUST NOT** use remote `$ref` URLs (e.g., `http://...`). All references must be local relative paths.

## 9. References

- [L1: Core Protocol](l1-core-protocol.md)
