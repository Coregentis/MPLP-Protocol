---
wrapperClassName: governance-page
---

# Contributing to MPLP Protocol

Thank you for your interest in contributing to the Multi-Agent Programming Language Protocol (MPLP). As a frozen specification, we have strict guidelines to maintain stability and interoperability.

## ⚠️ Protocol Status: FROZEN

**MPLP v1.0.0 is a FROZEN SPECIFICATION.**

*   **Normative Changes**: NOT PERMITTED in this repository branch. Any change to schemas, core logic, or normative documentation requires a new protocol version (e.g., v1.1 or v2.0) and must go through the formal RFC process.
*   **Allowed Contributions**:
    *   Bug fixes in non-normative code (examples, tools, scripts).
    *   Clarifications in documentation (non-normative).
    *   New examples or integration adapters.
    *   Performance improvements in reference implementations.

## 🚀 How to Contribute

### 1. Reporting Bugs
Please use the **Bug Report** issue template. Clearly describe:
*   The issue.
*   Steps to reproduce.
*   Expected vs. actual behavior.

### 2. Proposing Changes (RFC Process)
For any change that affects the protocol specification (schemas, event structures, flow contracts):
1.  Do NOT open a PR directly.
2.  Open an **RFC (Request for Comments)** issue using the RFC template.
3.  The MPLP Protocol Governance Committee (MPGC) will review the proposal.

### 3. Pull Request Process
1.  **Fork** the repository.
2.  **Branch** from `main`.
3.  **Make changes**.
4.  **Verify**:
    *   Run `pnpm install` to ensure dependencies are correct.
    *   Run `pnpm test` to execute the full test suite.
    *   **CRITICAL**: All Golden Tests (`tests/golden`) MUST pass.
    *   **CRITICAL**: All Schemas MUST validate (`scripts/validate-schemas.ts`).
5.  **Commit** using [Conventional Commits](https://www.conventionalcommits.org/).
6.  **Submit PR**.

## Development Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run tests
pnpm test
```

## License
By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.