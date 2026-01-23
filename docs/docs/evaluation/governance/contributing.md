---
sidebar_position: 6
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-GOV-CONTRIB-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Contributing to MPLP
sidebar_label: Contributing Guide
description: "MPLP governance documentation: Contributing to MPLP. Governance processes and policies."
authority: none
---

# Contributing to MPLP

## Protocol Status: FROZEN

## What You CAN Contribute

| Contribution Type | Allowed | Process |
|:---|:---:|:---|
| Bug fixes (non-normative) | ✅ | Pull Request |
| Documentation clarifications | ✅ | Pull Request |
| New examples | ✅ | Pull Request |
| Integration adapters | ✅ | Pull Request |
| Performance improvements | ✅ | Pull Request |
| New features (normative) | ⚠️ | RFC Required |
| Schema changes | ⚠️ | RFC Required |
| Breaking changes | ❌ | New Version Required |

## How to Contribute

### 1. Reporting Bugs

Use the **Bug Report** issue template:
- Describe the issue clearly
- Provide steps to reproduce
- Include expected vs. actual behavior

### 2. Proposing Changes (RFC Process)

For any change that affects the protocol specification:

1. **Do NOT open a PR directly**
2. Open an **RFC (Request for Comments)** issue using the RFC template
3. The MPLP Protocol Governance Committee (MPGC) will review the proposal
4. See [MIP Process](./protocol-governance.md) for details

### 3. Pull Request Process

1. **Fork** the repository
2. **Branch** from `main`
3. **Make changes**
4. **Verify** (see verification checklist below)
5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/)
6. **Submit PR**

## Verification Checklist

Before submitting a PR:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run tests
pnpm test
```

**Critical Requirements**:
- [ ] All Golden Tests (`tests/golden/`) MUST pass
- [ ] All Schemas MUST validate (`scripts/validate-schemas.ts`)
- [ ] No normative changes without RFC approval

## Repository Links

| Resource | Location |
|:---|:---|
| Root CONTRIBUTING.md | [CONTRIBUTING.md](https://github.com/Coregentis/MPLP-Protocol/blob/main/CONTRIBUTING.md) |
| Code of Conduct | [CODE_OF_CONDUCT.md](https://github.com/Coregentis/MPLP-Protocol/blob/main/CODE_OF_CONDUCT.md) |
| Security Policy | [Security Policy](./security-policy.md) |
| MIP Process | [MIP Process](./protocol-governance.md) |

## License

By contributing, you agree that your contributions will be licensed under the **Apache-2.0 License**.

---

**Repository**: [github.com/Coregentis/MPLP-Protocol](https://github.com/Coregentis/MPLP-Protocol)  
**RFC Required For**: Schema changes, normative changes, new features
