---
title: Deployment Checklist
description: Pre-deployment verification checklist for MPLP-based systems.
  Covers environment setup, dependency installation, configuration, validation
  tests, and post-deployment checks.
keywords:
  - Deployment Checklist
  - MPLP deployment
  - pre-deployment verification
  - environment setup
  - validation tests
  - post-deployment checks
sidebar_label: Deployment Checklist
doc_status: normative
doc_role: ops
protocol_alignment:
  truth_level: T0D
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
  normativity_scope: docs_governance
  governance_alignment:
    policy_refs:
      - docs/docs/99-meta/frontmatter-policy.md
    process_refs: []
normative_id: MPLP-CORE-DEPLOYMENT-CHECKLIST
sidebar_position: 2
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Deployment Checklist

## 1. Purpose

Pre-deployment verification steps for MPLP-based systems.

## 2. Pre-Deployment

### 2.1 Environment

- [ ] Node.js >= 20 installed
- [ ] Python >= 3.10 installed
- [ ] pnpm installed
- [ ] Database configured (if using persistent VSL)

### 2.2 Dependencies

- [ ] `pnpm install` completed
- [ ] `pip install -e packages/sdk-py` completed
- [ ] TypeScript SDK built: `pnpm -r build`

### 2.3 Configuration

- [ ] Environment variables set
- [ ] LLM API keys configured
- [ ] Tool endpoints accessible

## 3. Validation

### 3.1 Tests

- [ ] `pnpm test` passes
- [ ] `pnpm test:golden` passes
- [ ] `pytest` passes

### 3.2 Schema

- [ ] `node scripts/validate-schemas.js` passes
- [ ] FROZEN headers synced

## 4. Deployment

- [ ] Build artifacts created
- [ ] Container images built (if applicable)
- [ ] Health checks configured
- [ ] Rollback plan documented

## 5. Post-Deployment

- [ ] Smoke tests pass
- [ ] Monitoring alerts configured
- [ ] Logging enabled

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
