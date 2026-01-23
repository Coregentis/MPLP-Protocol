---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "GOV-README"
---

# MPLP Governance

> [!NOTE]
> This directory is governed by **MPGC** (MPLP Protocol Governance Committee).  
> **Governance Scheme Version**: v1.1.0 (Reflected in 7-layer restructuring).

> [!IMPORTANT]
> **This governance directory contains both Public Protocol Governance and Internal Operational Support.**  
> Only the **Public Governance set (Layers 01–04)** is considered part of MPLP's public governance contract.  
> Operational layers (Layer 06 and selected parts of Layer 05) are **non-normative implementation support** and may change without notice.

---

## 1. Purpose

This directory contains all governance documents for the MPLP protocol.

Governance documents define **who may do what, when, how, and with what evidence**.

---

## 2. Directory Structure

```
governance/
├── README.md                  # Unified Governance Index
├── EXECUTION_ORDER.md         # Governance execution sequence
│
├── 01-constitutional/         # L1: Foundation (PUBLIC - Governance Contract)
├── 02-methods/                # L2: Methods (PUBLIC - Governance Contract)
├── 03-distribution/           # L3: Distribution (PUBLIC - Governance Contract)
├── 04-records/                # L4: Records (PUBLIC - Governance Contract)
├── 05-specialized/            # L5: Domain (PARTIAL PUBLIC - projection/erc only)
├── 06-operations/             # L6: Operations (INTERNAL - may change)
└── 99-archive/                # L99: Archive (INTERNAL - deprecated)
```

---

## 3. Layer Descriptions

### 01-constitutional (Foundation)

Canonical documents defining the fundamental rules. Immutable foundation (Seal-protected).
- **CONST-001**: Entry Model Specification (v1.1 - 3+1 entries)
- **CONST-002**: Document Format Specification (v1.1 - 6 doc_types, 4 surfaces)

### 02-methods (Verification & Audit)

Verification methods and SOPs (Standard Operating Procedures).
- **schema/**: TSV, XCV, SCV, SUC methods for truth sources.
- **docs/**: DGA, DTAA, DTV methods for documentation alignment.

### 03-distribution (SDK & Release)

Governance for distributing artifacts to registries.
- **sdk/**: SDK release pipeline (SDKR-01 through 09).

### 04-records (Evidence & Accountability)

Immutable records of governance actions.
- **Seals**: Evidence anchors for specific builds/syncs.
- **Freeze Records**: Baselines for semantic/entity alignment.
- **Ratifications**: Formal MPGC motions and adoption records.

### 05-specialized (Domain Governance)

Governance for specific facets of the ecosystem.
- **website/**: Website-specific constraints and audits.
- **entity/**: Canonical entity and disambiguation policies.
- **script-audit/**: Repository script governance.

### 06-operations (Support & Execution)

Operational data and tools supporting governance execution.
- **tools/**: Linkmap runners and audit scripts.
- **rules/**: Validation regex, patterns, and allowlists.
- **artifacts/**: Audit outputs and reports.

### 99-archive

Historical or superseded schemes kept for narrative integrity.

---

## 4. Authority

All governance documents are governed by **MPGC** (MPLP Protocol Governance Committee).

Amendments require MPGC approval.

---

## 5. Quick Start

1. Read `EXECUTION_ORDER.md` to understand the governance sequence
2. Review `01-constitutional/` for foundation rules
3. Follow `02-methods/` for verification
4. Use `03-distribution/sdk/` for SDK publication

---

**Document Status**: Governance Entry Point  
**Supersedes**: None  
**References**: EXECUTION_ORDER.md
