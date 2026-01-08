---
sidebar_position: 4
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-SECURITY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Security Policy
sidebar_label: Security Policy
description: "MPLP governance documentation: Security Policy. Governance processes and policies."
authority: Documentation Governance
---

# Security Policy

## Supported Versions

| Version | Supported |
|:---|:---:|
| 1.0.x | ✅ Supported |
| < 1.0 | ❌ Not Supported |

## Reporting a Vulnerability

We take the security of the MPLP Protocol seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT open a public issue**
2. Email the details to **security@coregentis.com**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Affected components (e.g., specific schema, runtime module)
   - Potential impact assessment

## Response Timeline

| Phase | Timeframe |
|:---|:---|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Status Updates | Every 5 business days |
| Resolution Target | Severity-dependent |

## Severity Levels

| Severity | Response Target | Description |
|:---|:---|:---|
| **Critical** | 24-48 hours | Remote code execution, data breach |
| **High** | 7 days | Privilege escalation, authentication bypass |
| **Medium** | 30 days | Information disclosure, denial of service |
| **Low** | 90 days | Minor issues, defense-in-depth |

## Scope

This policy applies to:

| Component | Repository |
|:---|:---|
| Protocol Specifications | `schemas/v2/` |
| Reference Runtime | `@mplp/runtime-minimal` |
| Core Libraries | `@mplp/core`, `@mplp/coordination` |
| Integration Adapters | `@mplp/integration-*` |
| TypeScript SDK | `@mplp/sdk-ts` |
| Python SDK | `mplp` (PyPI) |

## Out of Scope

- Third-party implementations not maintained by MPGC
- Vulnerabilities in dependencies (report to upstream maintainers)
- Issues in non-release branches

## Disclosure Policy

Once a vulnerability is resolved:

1. We publish a **Security Advisory** on GitHub
2. We credit the reporter (if desired)
3. We update the **CHANGELOG** with CVE references
4. We notify downstream maintainers

## Related Documents

- [Root SECURITY.md](https://github.com/Coregentis/MPLP-Protocol/blob/main/SECURITY.md) — Repository-level security policy
- [Contributing Guide](./contributing.md) — How to contribute safely
- [Governance Constitution](./index.mdx) — Authority structure

---

**Contact**: security@coregentis.com  
**Response SLA**: 48 hours acknowledgment
