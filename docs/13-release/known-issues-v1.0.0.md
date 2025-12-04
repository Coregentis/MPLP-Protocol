# Known Issues & Limitations (v1.0.0)

This list applies strictly to MPLP Protocol v1.0.0 (Frozen).

This document lists known limitations and design constraints of the MPLP v1.0.0 release. These are not considered bugs but are intentional scope boundaries or areas for future improvement.

## 1. Protocol Limitations

### 1.1 Date-Time Precision
- **Limitation**: MPLP uses ISO 8601 strings for all timestamps.
- **Impact**: Sub-millisecond precision is not strictly enforced across all languages.
- **Workaround**: Implementations should preserve precision where possible but expect millisecond-level interoperability.

### 1.2 Multi-Agent Coordination
- **Limitation**: v1.0.0 focuses on **Single-Agent (SA)** and basic **Multi-Agent (MAP)** profiles. Complex dynamic team formation is experimental.
- **Status**: Advanced coordination patterns are scheduled for v2.0.

## 2. SDK Limitations

### 2.1 TypeScript SDK
- **Status**: Reference Implementation.
- **Limitation**: `additionalProperties: false` is not enforced at compile-time (TypeScript limitation), only at runtime via validators.

### 2.2 Python SDK
- **Status**: Preview / Codegen-Ready.
- **Limitation**: Not yet published to PyPI. Users should install from source or use the generated models directly.
- **Plan**: Official PyPI release targeted for v1.1.

## 3. Testing Limitations

### 3.1 Golden Flows
- **Coverage**: Flows 01-05 are the **Required Compliance Boundary**.
- **Gap**: Flows 06-25 are defined but not yet fully implemented in the Golden Harness. They serve as specification guidance.

## 4. Tooling

### 4.1 Schema Validation
- **Limitation**: `ts-node` execution of validation scripts may require specific environment flags (`--transpile-only`).
- **Workaround**: Use the provided `pnpm test:golden` or `node scripts/validate-schemas.js` (if available) which handle this.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
