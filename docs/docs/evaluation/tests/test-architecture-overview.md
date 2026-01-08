---
sidebar_position: 2
entry_surface: documentation
doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-TEST-ARCH-001"
description: "Overview of the MPLP testing architecture including test categories, locations, and evidence mapping."
title: Test Architecture Overview
sidebar_label: Test Architecture
---

# Test Architecture Overview


## Scope

This document defines:
- Categories of tests in the MPLP repository
- Directory structure and test locations
- Mapping between tests and protocol evidence

## Non-Goals

- Test execution instructions (see SDK documentation)
- CI/CD configuration (see repository `.github/workflows/`)
- Test case implementation details

---

## 1. Test Categories

MPLP employs a multi-layer testing strategy aligned with the protocol architecture.

| Category | Purpose | Location |
|:---------|:--------|:---------|
| **Golden Flows** | Lifecycle validation fixtures | `tests/golden/` |
| **Schema Alignment** | JSON Schema conformance | `tests/schema-alignment/` |
| **Runtime Compatibility** | Cross-version runtime tests | `tests/runtime-compat/` |
| **Cross-Language** | Python/TS interoperability | `tests/cross-language/` |
| **SDK Unit Tests** | SDK function validation | `packages/sources/sdk-ts/tests/` |
| **Integration Tests** | L4 integration validation | `packages/npm/integration-*/tests/` |

---

## 2. Golden Flow Tests

Golden Flows provide reference evidence artifacts for protocol conformance evaluation.

| Flow ID | Name | Protocol Layer |
|:--------|:-----|:---------------|
| GF-01 | Single-Agent Lifecycle | L1 Core |
| GF-02 | Multi-Agent Coordination | L2 Coordination |
| GF-03 | Drift Detection | L3 Runtime |
| GF-04 | Delta Intent | L2 Coordination |
| GF-05 | Governance | L2 Coordination |

**Location**: `tests/golden/flows/`

**Documentation**: [Golden Flows](/docs/evaluation/golden-flows)

---

## 3. Schema Alignment Tests

Schema alignment tests verify that SDK outputs conform to JSON Schema definitions.

**What They Validate**:
- Builder outputs match schema structure
- Required fields are present
- Enum values are valid

**Location**: `tests/schema-alignment/`

**Example**: `ts-schema-alignment.test.ts`

---

## 4. Runtime Compatibility Tests

Runtime compatibility tests ensure cross-version and cross-package consistency.

**What They Validate**:
- Runtime error handling follows protocol patterns
- SDK-to-runtime handoff preserves data integrity

**Location**: `tests/runtime-compat/`

---

## 5. Cross-Language Tests

Cross-language tests verify Python and TypeScript SDK interoperability.

**What They Validate**:
- Builder outputs are identical across languages
- Validation logic produces consistent results

**Location**: `tests/cross-language/`

| Subcategory | Purpose |
|:------------|:--------|
| `builders/` | Builder function consistency |
| `validation/` | Schema validation consensus |

---

## 6. Integration Tests

Integration tests validate L4 integration layer components.

**Packages with Integration Tests**:

| Package | Purpose |
|:--------|:--------|
| `@mplp/integration-llm-http` | LLM HTTP client |
| `@mplp/integration-storage-fs` | Filesystem storage |
| `@mplp/integration-storage-kv` | Key-value storage |
| `@mplp/integration-tools-generic` | Generic tool executor |
| `@mplp/runtime-minimal` | Minimal runtime |

**Location**: `packages/npm/integration-*/tests/`

---

## 7. Evidence Mapping

Tests map to protocol conformance dimensions:

| Conformance Dimension | Test Categories |
|:----------------------|:----------------|
| Schema Validity | Schema Alignment, SDK Unit |
| Lifecycle Completeness | Golden Flows, Runtime Compat |
| Trace Integrity | Golden Flows |
| Governance Gating | GF-05 |

---

## 8. Related Documentation

- [Golden Test Suite Overview](./golden-test-suite-overview.md) — Philosophy
- [Golden Flow Registry](./golden-flow-registry.md) — Flow index
- [Golden Fixture Format](./golden-fixture-format.md) — JSON format
- [Golden Flows](/docs/evaluation/golden-flows) — Flow specifications

---

**Test Categories**: 6  
**Golden Flows**: 5
