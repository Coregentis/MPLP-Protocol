# MPLP Governance

**Document ID**: GOV-README  
**Status**: Active  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This directory contains all governance documents for the MPLP protocol.

Governance documents define **who may do what, when, how, and with what evidence**.

---

## 2. Directory Structure

```
governance/
├── README.md                  # You are here
├── EXECUTION_ORDER.md         # Governance execution sequence
│
├── 01-constitutional/         # Layer 1: Foundation (immutable)
├── 02-methods/                # Layer 2: Verification Methods
├── 03-sdk-release/            # Layer 3: SDK Distribution
├── 04-records/                # Layer 4: Evidence & Phase Records
└── 99-archive/                # Archive (deprecated schemes)
```

---

## 3. Layer Descriptions

### 01-constitutional (Foundation)

Constitutional documents define the fundamental rules that govern all other governance documents.

- **CONST-001**: Entry Model Specification
- **CONST-002**: Document Format Specification
- **CONST-003**: Frozen Header Specification
- **CONST-004**: Documentation Audit Methodology

These documents are **immutable** within a protocol version.

### 02-methods (Verification Methods)

Verification methods define how to verify Truth Source integrity and SDK conformance.

- **verification/**: TSV, XCV, SCV, SUC methods
- **evolution/**: DIV, EVC methods

### 03-sdk-release (SDK Distribution)

SDK release governance defines how SDKs may be published.

- 7 METHOD documents (SDKR-01 through SDKR-07)
- Release checklist
- Version registry
- MPGC approval record

### 04-records (Evidence & Phases)

Records of completed verification phases and frozen baselines.

- **baselines/**: Evidence Baseline freeze records
- **phases/**: Phase completion records

### 99-archive

Deprecated or superseded documents for historical reference.

---

## 4. Authority

All governance documents are governed by **MPGC** (MPLP Protocol Governance Committee).

Amendments require MPGC approval.

---

## 5. Quick Start

1. Read `EXECUTION_ORDER.md` to understand the governance sequence
2. Review `01-constitutional/` for foundation rules
3. Follow `02-methods/` for verification
4. Use `03-sdk-release/` for SDK publication

---

**Document Status**: Governance Entry Point  
**Supersedes**: None  
**References**: EXECUTION_ORDER.md
