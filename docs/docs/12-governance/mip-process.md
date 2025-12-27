---
doc_type: governance
status: frozen
authority: Documentation Governance
description: ""
title: MIP Process
---

# MIP Process

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

**Status**: Active


## 1. Purpose

The MIP (MPLP Improvement Proposal) process is the primary mechanism for proposing new features, changes to the protocol specification, or community standards.

## 2. MIP Types

| Type | Description |
|:---|:---|
| **Standards Track** | Describes a new feature or implementation for the protocol |
| **Informational** | Provides guidelines or information, does not propose a standard |
| **Process** | Describes a process (or an event in a process) |

## 3. MIP Status

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Accepted
    Review --> Rejected
    Accepted --> Final
    Accepted --> Deferred
    Final --> Replaced
```

| Status | Description |
|:---|:---|
| **Draft** | The author is writing the proposal |
| **Review** | Community is reviewing the proposal |
| **Accepted** | Approved for implementation |
| **Rejected** | Proposal denied |
| **Final** | Implementation complete, part of the standard |
| **Deferred** | Postponed for future consideration |
| **Replaced** | Superseded by a newer MIP |

## 4. Contributing a MIP

1. Fork the repository
2. Copy `mips/mip-template.md`
3. Fill in the required sections:
   - **Title**: Short descriptive title
   - **Author**: Name/Email
   - **Status**: Draft
   - **Abstract**: Summary of the proposal
   - **Motivation**: Why is this needed?
   - **Specification**: Technical details
   - **Backward Compatibility**: Impact on existing systems
4. Submit a Pull Request to the `mips/` directory

## 5. Review Process

1. **Submission**: Author submits PR with MIP markdown file
2. **Discussion**: Community discusses via GitHub Issues/PR comments
3. **Voting**: MPGC members vote on acceptance
4. **Decision**: MIP is accepted, rejected, or deferred