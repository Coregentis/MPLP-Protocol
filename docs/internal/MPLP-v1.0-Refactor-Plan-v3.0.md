---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP Protocol v1.0 — World-Class, Vendor-Neutral Refactor Plan (Final v3.1)

**Single Source of Truth for the Whole V1.0 Rebuild**

---

# **0. Vision & Absolute Scope**

## **0.1 Physical Layout: `V1.0-release/` = The Only Official Repository**


**未来所有对外发布（GitHub Release / NPM / PyPI / Go module / Maven）
全部以 `V1.0-release/` 为基础发布。**

旧目录＝只读参考区，不再写入。

---

## **0.2 Project Goal：Protocol-First, Vendor-Neutral**

`V1.0-release/` 代表且只代表：

> **MPLP Protocol v1.0 — a JSON-based, vendor-neutral, implementation-agnostic protocol for multi-agent lifecycle governance.**

它不是：


它的定位与期望对齐：


即：**纯协议仓库 + reference runtime + SDK + schemas + conformance test suite**。

---

## **0.3 Global Constraints (Hard Rules)**

1.  **Language Constraint**:
2.  **Vendor-Neutral Constraint**:

---

## **0.4 Final Target (World-Class Protocol Output Set)**

`V1.0-release/` 必须包含并最终发布：

### **1) Formal Specification**


### **2) 4-Layer Architecture**


### **3) Schema Set：JSON Schema v2**


### **4) Multi-language SDK（Minimal, Protocol-Faithful）**

一次性提供：


全部基于 **schema v2 codegen 或机械派生**。

### **5) Reference Runtime**


### **6) Golden Test Suite（25 Canonical Flows）**


### **7) Governance & SemVer**


### **8) OSS Engineering**


---

# **1. Target Directory Structure（全部在 `V1.0-release/` 下）**

```text
V1.0-release/
  .github/
    workflows/
      ci.yml
      release.yml

  docs/
    00-spec/
    01-architecture/
    02-modules/
    03-cross-cutting/
    04-schemas/
    05-runtime/
    06-sdk/
    07-examples/
    08-governance/
      mip-process.md
      versioning-policy.md
      compatibility-matrix.md
    99-meta/

  schemas/
    v2/
      mplp-context.schema.json
      mplp-plan.schema.json
      mplp-confirm.schema.json
      mplp-trace.schema.json
      mplp-role.schema.json
      mplp-extension.schema.json
      mplp-dialog.schema.json
      mplp-collab.schema.json
      mplp-core.schema.json
      mplp-network.schema.json
      common/
        identifiers.schema.json
        timestamps.schema.json
        actors.schema.json
        events.schema.json
        learning-sample.schema.json

    legacy/
      ...(optional historic schemas)

  packages/
    core-protocol/
    coordination/
    reference-runtime/
    integration/
      llm-http/
      tools-generic/
      storage-fs/
      storage-kv/
    sdk-ts/
    sdk-py/
    sdk-go/
    sdk-java/

  examples/
    ts-single-agent-basic/
    ts-multi-agent-collab/
    py-basic-flow/
    go-basic-flow/
    java-basic-flow/

  scripts/
    generate-types-from-schemas.ts
    generate-py-models-from-schemas.ts
    generate-go-models-from-schemas.ts
    generate-java-models-from-schemas.ts
    validate-schemas.ts
    release-helper.ts

  README.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  GOVERNANCE.md
  LICENSE
  CHANGELOG.md
  .gitignore
  .editorconfig
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

**根目录中的任何历史目录都不允许复制进来。
旧代码＝只读资料，不进入发布物。**

---

# **2. Migration Principles（最关键部分）**

为了避免重写浪费，你必须严格遵循：

## **2.1 Schema v2 → 100% 复用（不重写）**

根目录已有的 schema v2 是成熟资产，做法是：



**不改变字段、不改语义、不改结构。**

---

## **2.2 Validator & Validator Tests → 复用迁移**

做法：

1.  **First**: Copy existing validator and tests from the legacy root.
2.  **Then**: Adjust imports & strip product-specific bits.
3.  **Only if necessary**: Refactor internals for new structure.

**Do not rewrite from scratch unless absolutely necessary.**

---

## **2.3 Golden Flows → 不重写语义，只迁移 harness**

旧测试中如果有：


→ 一律迁移到 `V1.0-release/tests/e2e/golden/`，只换调用 API。

**测试语义完全不能变，因为它代表协议不变量。**

---

## **2.4 旧 Runtime / 旧 Flow 逻辑 → 用作“参考”，非直接迁移**

部分旧 runtime 逻辑可以指导：


但是为了协议纯度，L3 需要：


**所以 runtime 是“参考 + 重写”，不是“直接迁移”。**

---

# **3. Phased Execution Plan (P0 → P8)**

（此版本已经包含“迁移 > 重写”的策略）

---

## **P0 – Bootstrap `V1.0-release` & Declare Boundaries**

目标：


---

## **P1 – Documentation Skeleton**

目标：


---

## **P2 – Schema v2.x Migration（复用）**

目标：


---

## **P3 – L1 Core Protocol（迁移 Validator + Tests）**

目标：


---

## **P4 – L2 Coordination & Governance（NEW）**

目标：


---

## **P5 – L3 Reference Runtime（参考旧实现，但重写）**

目标：


---

## **P6 – L4 Integration & Examples（NEW）**

目标：


---

## **P7 – Multi-language SDKs + Golden Suite（复用旧测试语义）**

目标：


---

## **P8 – OSS Hardening & v1.0.0 Release**

目标：


---

# **4. Final Execution Rules for AI Assistant**

这段就是你给 AI 助手的“行为宪法”：

> ### **MPLP v1.0 Refactor – Final Execution Rules**
>
> **1. All MPLP v1.0 work MUST be done inside `V1.0-release/` only.**
> **2. The legacy root is READ-ONLY reference.** You MAY read old code, schemas, validators, and tests, but MUST NOT depend on or modify them.
> **3. Schema v2 MUST be reused exactly.** Move/copy existing schemas into `V1.0-release/schemas/v2` with minimal changes (`$id`, naming, English doc).
> **4. Validators and validator tests SHOULD be migrated from the legacy root.** Adjust import paths and remove product coupling.
> **5. Golden flow semantics MUST be preserved.** Old test semantics are migrated, not rewritten.
> **6. Models for all SDKs MUST come from schema v2 codegen or mechanical derivation. No hand-written drift is allowed.**
> **7. L1/L2 code MUST contain zero IO.**
> **8. L3 runtime MUST be vendor-neutral. No provider name or product logic may appear.**
> **9. All docs, code, comments, errors under `V1.0-release/` MUST be in English.**
> **10. Every phase MUST keep `V1.0-release` buildable, testable, and CI-green.**
> **11. No deprecated modules or legacy code may appear in the final v1.0 release.**
> **12. Release artifacts MUST only include content under `V1.0-release/`.**
