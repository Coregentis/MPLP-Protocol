---
title: Ops Overview
description: Operational standards and overview for running MPLP-based systems in production. Covers high availability, security, cost management, and key operational runbooks.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Ops Overview, MPLP operations, production standards, high availability, security requirements, cost management, operational runbooks]
sidebar_label: Ops Overview
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Ops Overview

## 1. Purpose

The **MPLP Ops Guide** defines the operational standards for running MPLP-based systems in production environments.

## 2. Operational Requirements

| Requirement | Description |
|:---|:---|
| **High Availability** | Keep PSG (Plan State Graph) up 99.9%+ SLA |
| **Protection** | Protect PSG from corruption, maintain backups |
| **Security** | Rotate keys, patch vulnerabilities, enforce RBAC |
| **Cost Management** | Monitor and limit LLM token spend |

## 3. Operational Runbooks

| Runbook | Purpose |
|:---|:---|
| [Deployment Checklist](./deployment-checklist.md) | Pre-deployment verification steps |
| [Monitoring Guide](./monitoring-guide.md) | Observability setup and alerts |
| [Release Runbook](./release-runbook.md) | Version release procedures |
| [Schema Change Process](./schema-sdk-change-process.md) | Schema/SDK update workflow |

## 4. Key Scenarios

Operators must have runbooks for:

- **Drift Storms**: When many files change at once
- **LLM Failures**: Rate limits, timeouts, model unavailability
- **State Corruption**: PSG recovery procedures
- **Security Incidents**: Credential rotation, audit logging

## 5. Related Documentation

- [Runtime Overview](../06-runtime/runtime-glue-overview.md)
- [Maintainer Guide](../13-release/maintainer-guide.md)
- [Security Policy](../12-governance/security-policy.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
