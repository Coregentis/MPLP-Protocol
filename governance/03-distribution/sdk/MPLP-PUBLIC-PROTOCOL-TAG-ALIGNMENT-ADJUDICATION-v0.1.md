---
entry_surface: repository
doc_type: governance
status: approved
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-PUBLIC-PROTOCOL-TAG-ALIGNMENT-ADJUDICATION-v0.1"
title: "MPLP Public Protocol Tag Alignment Adjudication v0.1"
---

# MPLP Public Protocol Tag Alignment Adjudication v0.1

## 1. Executive Decision

本文件用于关闭当前 frozen governance chain 中关于
`protocol-v1.0.0` target alignment 的狭义治理缺口。

当前必须被显式裁决的问题是：

- `protocol-v1.0.0` 当前仍指向 dev-line sealed payload milestone
- current public branch truth 已经成立于
  `a695c66444260e0fe185193d276d54263fd474bf`
- 若要 future public publish `protocol-v1.0.0`，是否允许先做 target alignment

本文件只裁决：

- protocol tag semantic alignment legality
- same-name cross-remote semantics rule
- alignment 与 publication 的分离关系

本文件不执行：

- tag mutation
- tag publication
- public tag push

## 2. Governing Inputs

本裁决建立在以下 frozen governance chain 之上：

- policy baseline:
  - `MPLP-PUBLIC-PROMOTION-POLICY-BASELINE-v0.1.md`
  - commit `616c8db52`
- execution spec:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-SPEC-v0.1.md`
  - commit `361867886`
- import/exclude adjudication matrix:
  - `MPLP-PUBLIC-PROMOTION-IMPORT-EXCLUDE-ADJUDICATION-MATRIX-v0.1.md`
  - commit `d2caf8457`
- execution review:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-REVIEW-2026-04-06.md`
  - commit `043a87914`
- execution approval:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-EXECUTION-APPROVAL-2026-04-06.md`
  - commit `749c2a424`
- verification substrate adjudication:
  - `MPLP-PUBLIC-PROMOTION-VERIFICATION-SUBSTRATE-ADJUDICATION-v0.1.md`
  - commit `dac08149f`
- promotion branch seal:
  - `MPLP-PUBLIC-PROMOTION-BRANCH-SEAL-2026-04-06.md`
  - commit `2f4fc2584`

当前 truth split:

- current tag name:
  - `protocol-v1.0.0`
- current dev target:
  - `fef2370d59dee062bdfb17aff14a0166792334ce`
- current public truth target:
  - `a695c66444260e0fe185193d276d54263fd474bf`

## 3. Current Tag Semantics and Truth Split

Current adjudicated meaning:

- `protocol-v1.0.0` currently represents:
  - a dev-line sealed payload milestone on `protocol-dev`
- it does **not** currently represent:
  - the current public branch truth release tag

Current semantic relation between the two targets:

- `fef2370d59...` and `a695c66444...` are not the same truth object
- the current public truth includes post-`fef...` public-history reconciliation
  and branch-sealed verification state

Therefore:

- current same-name semantics are split
- current public publication is not admissible without an explicit alignment rule

Required judgment fields:

- current tag name: `protocol-v1.0.0`
- current dev target: `fef2370d59...`
- current public truth target: `a695c66444...`
- same-name cross-remote divergence acceptable: `NO`
- target migration governance-legal: `YES`
- migration must precede publication: `YES`
- publication still needs a later separate adjudication: `YES`

## 4. Cross-Remote Same-Name Semantics Rule

### Rule 1 — Same-Name Cross-Remote Ambiguity Is Not Silent

同名 `protocol-v1.0.0` 如果在不同 remotes 上指向不同 truth，不能被默认视为
可接受状态。

必须显式裁决。

### Rule 2 — Same-Name Cross-Remote Divergence Acceptability

裁决：

- same-name cross-remote divergence acceptable: `NO`

理由：

- `protocol-v1.0.0` 作为 protocol-line public tag 时，必须能绑定单一、
  可审计、可解释的 protocol truth
- 若 `protocol-dev` 与 public remotes 上同名 tag 指向不同 truth，会直接造成
  cross-remote ambiguity

### Rule 3 — Same-Name Cross-Remote Alignment Requirement

若 future public publication 要使用同名 `protocol-v1.0.0`，则：

- `protocol-dev` 与 public remotes 上该 tag 必须最终保持同一语义
- 且应保持同一 target

这意味着：

- 若当前 target 不一致，必须先完成显式 alignment
- alignment 完成前，不得进入 public publication

## 5. Tag Alignment Mutation Adjudication

### Core Adjudication

本文件裁决：

- target migration governance-legal: `YES`

但 legal basis 仅限于：

- governance-approved semantic re-binding under frozen governance

而不是：

- silent semantic lift
- informal reuse
- automatic dev-to-public carryover

### Alignment Action Nature

alignment 动作的法律性质是：

- `tag retarget requiring explicit approval`
- simultaneously serving as a governance-approved semantic re-binding

原因：

- 当前 `protocol-v1.0.0` 在 `protocol-dev` 上承载的是 dev milestone 语义
- 若要让它承载 public protocol truth，必须显式迁移其语义绑定
- 这种迁移不能静默发生

### Allowed Future Alignment Path

允许的未来 alignment path 为：

- `protocol-v1.0.0`
  from:
  - `fef2370d59dee062bdfb17aff14a0166792334ce`
  to:
  - `a695c66444260e0fe185193d276d54263fd474bf`

但该动作：

- 只能作为一个单独、后续的 execution step
- 不能与 public publication 混成同一步
- 不能借此改变 legacy bare `v1.0.0`

### No Silent Dev-to-Public Semantic Lift

`protocol-dev` 上的 dev milestone 语义不得静默提升为 public truth 语义。

若允许迁移，只能基于本文件的显式 adjudication。

## 6. Publication Prerequisite Rule

裁决：

- migration must precede publication: `YES`
- publication still needs a later separate adjudication: `YES`

这意味着：

1. 先有 alignment
2. 再有单独 public tag publication adjudication
3. 然后才可能有任何 public tag push

当前不允许：

- 先 publish 再解释 alignment
- 用 current dev target 直接进入 public remotes

## 7. Guardrails and Stop Conditions

### Rule 1 — Alignment Is Not Publication

即便 alignment 被批准，也不等于 public publication 被批准。

### Rule 2 — Legacy Bare Tag Isolation

任何 alignment 或 publication decision 都不得：

- 修改 `v1.0.0`
- 删除 `v1.0.0`
- 替代 `v1.0.0`
- 重释义 `v1.0.0`

### Rule 3 — No Namespace Rewrite

本文件不修改 frozen namespace policy：

- future protocol-line public tags still use `protocol-vX.Y.Z`

### Rule 4 — No Silent Cross-Remote Split

若 alignment 未完成，则：

- `protocol-v1.0.0` 不得进入 public remotes

### Stop Conditions

若后续 alignment execution 出现以下任一情况，必须停止：

- 需要借 alignment 改写 legacy `v1.0.0`
- 需要在未单独 adjudicate publication 前直接 push `protocol-v1.0.0`
- 需要让同名 `protocol-v1.0.0` 在不同 remotes 上长期保持不同语义/target
- 需要修改 namespace policy 才能成立

## 8. Final Adjudication Verdict

- `APPROVED_AND_FROZEN`
- path verdict:
  - `ALIGNMENT_MUTATION_APPROVED_UNDER_GOVERNANCE`

This means:

- `protocol-v1.0.0` is allowed to undergo a future explicitly approved target
  alignment from dev milestone truth to public truth
- that alignment remains a separate execution step
- public publication remains separately adjudicated and is not approved by this
  document

## 9. Approval Effect

Once frozen, this adjudication becomes the governing source for:

- whether `protocol-v1.0.0` may legally migrate from current dev target
  `fef2370d59...` to current public truth target `a695c66444...`
- whether same-name cross-remote divergence is acceptable
- whether migration must precede publication

It does not authorize:

- immediate tag mutation
- immediate tag publication
- public tag push
