---
sidebar_position: 2

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Explicit non-goals for MPLP Enterprise context."
title: Enterprise Non-Goals
keywords: [MPLP, Enterprise, Non-Goals, Exclusions]
sidebar_label: Non-Goals

---



# Enterprise Non-Goals


## 1. Purpose

This document explicitly states what MPLP does **NOT** provide for enterprise contexts.

These are not "missing features" or "coming soon" — they are **deliberate exclusions** to maintain MPLP's role as a vendor-neutral protocol standard.

## 2. Explicit Non-Goals

### 2.1 Certification Programs

| We Do NOT Provide | Reason |
|:---|:---|
| **MPLP Certification** | Not a certification body |
| **Certified Vendor** badges | No vendor endorsement |
| **Certified Runtime** lists | Vendor-neutral |
| **Certification fees** | Not a commercial program |

**Implication**: Third parties may offer certification programs that reference MPLP. These are not endorsed by MPLP.

### 2.2 Legal Compliance

| We Do NOT Provide | Reason |
|:---|:---|
| **Regulatory compliance** | Not a legal authority |
| **GDPR/HIPAA/SOC2 mapping** | Legal scope varies by jurisdiction |
| **Compliance attestation** | Cannot attest on behalf of implementers |
| **Legal advice** | Not a law firm |

**Implication**: MPLP conformance does not imply legal compliance. Legal review must be performed independently.

### 2.3 Commercial Offerings

| We Do NOT Provide | Reason |
|:---|:---|
| **SaaS products** | Protocol, not product |
| **Managed services** | Vendor-specific |
| **Enterprise support** | Vendor-specific |
| **Pricing tiers** | Not a commercial entity |

**Implication**: Commercial MPLP products are built by vendors, not by the MPLP project.

### 2.4 Implementation Details

| We Do NOT Provide | Reason |
|:---|:---|
| **Deployment architectures** | Implementation-specific |
| **Infrastructure templates** | Cloud-specific |
| **CI/CD pipelines** | Tooling-specific |
| **Scaling guides** | Runtime-specific |

**Implication**: Implementation guidance is provided by SDK documentation, not Enterprise context.

### 2.5 Vendor Integrations

| We Do NOT Provide | Reason |
|:---|:---|
| **Cloud provider integrations** | Vendor-neutral |
| **LLM provider integrations** | Vendor-neutral |
| **Tool integrations** | Vendor-neutral |
| **Framework adapters** | Implementation-specific |

**Implication**: Integrations are built by SDK authors or vendors, not mandated by protocol.

## 3. Why These Exclusions Matter

### 3.1 Protocol Neutrality

MPLP's value comes from being **vendor-neutral**. The moment we provide:
- Certification → We pick winners
- Compliance mapping → We take legal positions
- Commercial offerings → We compete with adopters

### 3.2 Longevity

Protocols that stay neutral survive longer:
- TCP/IP didn't sell routers
- HTTP didn't sell web servers
- POSIX didn't sell operating systems

MPLP follows the same model.

### 3.3 Adoption Breadth

By excluding commercial scope, MPLP can be adopted by:
- Startups building agent products
- Enterprises building internal platforms
- Open source projects
- Academic research

## 4. What Enterprise CAN Expect

While we exclude commercial offerings, enterprise adopters can expect:

| We DO Provide | How |
|:---|:---|
| **Stable protocol** | Frozen specification |
| **Evidence model** | Schema-validated artifacts |
| **Conformance criteria** | Criteria for binary evaluation |
| **Reference implementation** | Open source SDKs |
| **Governance framework** | Versioning and change control |

## 5. Related Documentation

- [Enterprise Context](./index.mdx) — Enterprise scope definition
- [Conformance Model](/docs/evaluation/conformance) — What we DO evaluate
- [Versioning Policy](/docs/evaluation/governance/versioning-policy) — Protocol stability

---

**Purpose**: Prevent scope creep and maintain vendor neutrality  
**Key Principle**: Protocol, not product
