---
title: Monitoring Guide
description: Observability standards and monitoring guide for MPLP production
  systems. Defines key metrics, health checks, log levels, and recommended
  alerts.
keywords:
  - Monitoring Guide
  - MPLP observability
  - production monitoring
  - key metrics
  - health checks
  - logging standards
  - alerts
sidebar_label: Monitoring Guide
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
normative_id: MPLP-CORE-MONITORING-GUIDE
sidebar_position: 3
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Monitoring Guide

## 1. Purpose

This guide defines observability standards for MPLP production systems.

## 2. Key Metrics

### 2.1 Runtime Metrics

| Metric | Description | Alert Threshold |
|:---|:---|:---|
| `mplp_plan_execution_duration_ms` | Plan execution time | > 30s |
| `mplp_step_failure_rate` | Step failure percentage | > 5% |
| `mplp_llm_token_usage` | LLM token consumption | Budget-based |
| `mplp_psg_operations_per_sec` | PSG read/write ops | > 1000/s |

### 2.2 Health Checks

| Check | Endpoint | Expected |
|:---|:---|:---|
| Runtime alive | `/health` | 200 OK |
| Schema validation | `/health/schema` | 200 OK |
| LLM connectivity | `/health/llm` | 200 OK |

## 3. Logging

### 3.1 Log Levels

| Level | Usage |
|:---|:---|
| `ERROR` | Failures requiring attention |
| `WARN` | Degraded performance |
| `INFO` | Normal operations |
| `DEBUG` | Troubleshooting (dev only) |

### 3.2 Trace Correlation

All logs should include:
- `trace_id`
- `context_id`
- `plan_id`

## 4. Alerts

| Alert | Condition | Action |
|:---|:---|:---|
| High Latency | p99 > 30s | Scale or investigate |
| Error Rate | > 5% | Check logs |
| Token Budget | > 80% | Review usage |

## 5. Dashboards

Recommended dashboard panels:
- Plan execution success/failure rate
- Step latency histogram
- LLM token usage over time
- Error trends

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
