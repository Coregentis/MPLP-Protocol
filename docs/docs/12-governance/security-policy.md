---
title: Security Policy
description: Official Security Policy for MPLP. Instructions for reporting vulnerabilities, response timelines, and scope of security coverage.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Security Policy, MPLP security, vulnerability reporting, security response, embargo period, security scope]
sidebar_label: Security Policy
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Security Policy

**Status**: Active
**Version**: 1.0.0

## 1. Reporting Vulnerabilities

We take security seriously. If you discover a vulnerability in the MPLP Protocol, SDKs, or reference implementations:

> [!IMPORTANT]
> **Do NOT report security issues via public GitHub Issues.**

### 1.1 Private Disclosure

Email: `security@coregentis.com`

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### 1.2 Response Timeline

| Phase | Timeline |
|:---|:---|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 7 days |
| Fix Development | 30-90 days (severity dependent) |
| Public Disclosure | After fix is released |

## 2. Scope

### 2.1 In Scope

| Component | Repository/Location |
|:---|:---|
| Protocol Specification | `docs/`, `schemas/` |
| TypeScript SDK | `packages/sdk-ts/` |
| Python SDK | `packages/sdk-py/` |
| Reference Runtime | `packages/reference-runtime/` |

### 2.2 Out of Scope

- Vulnerabilities in third-party LLMs or tools used by agents
- Issues in user implementations of the protocol
- Social engineering attacks

## 3. Embargo Period

Security fixes may be subject to an embargo period before public disclosure to allow:
- Time for users to update
- Coordination with affected parties
- Development of mitigations

## 4. Contact

- **Security Email**: `security@coregentis.com`
- **GPG Key**: Available at `/.well-known/security.txt`

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
