---
sidebar_position: 5

doc_type: informative
normativity: informative
status: draft
authority: Documentation Governance
description: "Implementation guidance for projecting MPLP JSON Schema artifacts into language-specific types; not a frozen protocol standard."
title: Schema Mapping Standard
---

# Schema Mapping Standard

> [!NOTE]
> **Implementation Guidance Only**
>
> This page is not a frozen protocol-side standard. It does not create a
> universal SDK obligation for every language binding.

## 1. Purpose

This guide describes a conservative way to think about projecting MPLP
repository-backed JSON Schema artifacts into language-specific types.

Its role is explanatory only. Frozen protocol meaning remains in:

- `schemas/v2/`
- repaired module/profile/observability pages
- current package surfaces documented in the SDK guides

## 2. Boundary

This page does **not** define:

- a mandatory cross-language conformance constitution
- a protocol-breaking law for all SDKs
- required generated-model surfaces for every language
- a substitute for actual published package exports

## 3. Safe Reading Rule

When using this guide:

1. treat JSON Schema as the upstream data-shape source
2. treat published package exports as the actual package-surface source
3. treat this page only as implementation guidance for teams authoring or
   generating bindings

## 4. Guidance Principles

Conservative guidance for schema-to-language projection:

- preserve field names from the source schema
- preserve required vs optional distinctions from the source schema
- preserve enum membership from the source schema
- preserve nested object structure from the source schema
- avoid adding language-level convenience semantics that rewrite the protocol

## 5. Language Guidance

### TypeScript

Common implementation approach:

- strings -> `string`
- integers/numbers -> `number`
- booleans -> `boolean`
- arrays -> `T[]`
- enums -> string literal unions or equivalent narrow types

### Python

Common implementation approach:

- strings -> `str`
- integers -> `int`
- numbers -> `float`
- booleans -> `bool`
- arrays -> `list[...]` or equivalent
- enums -> `Literal[...]`, enum types, or equivalent

These are implementation patterns, not frozen protocol obligations.

## 6. Validation Boundary

Validation behavior should be read from:

- the schema artifacts themselves
- the actual validator/package surfaces in scope

This page does not define one mandatory cross-language validation result
contract.

## 7. Read Next

- [TypeScript SDK Guide](./ts-sdk-guide.md)
- [Python SDK Guide](./py-sdk-guide.md)
- [Implementation Maturity Matrix](./implementation-maturity-matrix.md)

---

**Final Boundary**: this page is implementation guidance for schema projection.
It is not a frozen protocol standard or a package-surface contract by itself.
