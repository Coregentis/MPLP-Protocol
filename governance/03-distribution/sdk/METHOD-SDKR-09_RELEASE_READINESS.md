---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-09_RELEASE_READINESS"
---

# METHOD-SDKR-09: Release Readiness Governance

**Document ID**: METHOD-SDKR-09  
**Status**: Frozen (v1.0)  
**Authority**: MPGC  
**Effective**: 2026-01-04  
**Supersedes**: None

---

## 1. Purpose

This document defines **the conditions under which an MPLP SDK package is eligible for publication**.

This is not a pipeline definition (SDKR-01) nor a content specification (SDKR-04).  
This is the **Release Eligibility Gate** — the answer to:

> **"When is a package ready to be published?"**

---

## 2. Scope

This METHOD applies to:
- All `@mplp/*` npm packages
- All MPLP PyPI packages (e.g., `mplp-sdk`)
- Any future SDK packages in any ecosystem

This METHOD does NOT apply to:
- Protocol specification documents
- Website or documentation deployments
- Internal CI tooling

---

## 3. Core Principle (NON-NEGOTIABLE)

> **No release may bypass Stage 4 Isolated Verification, regardless of change size or version bump type.**

This principle has no exceptions. A "tiny fix" and a "major feature" undergo the same verification.

**Rationale**: Once exceptions are allowed, the gate becomes meaningless within months.

---

## 4. 8-Stage Release Readiness Framework

Every release MUST pass through all 8 stages **in order**.  
Stage failure = **Release blocked**.

```
┌─────────────────────────────────────────────────────┐
│  Stage 0 │ Release Intent Declaration               │
├─────────────────────────────────────────────────────┤
│  Stage 1 │ Version Legitimacy Validation            │
├─────────────────────────────────────────────────────┤
│  Stage 2 │ Dependency Integrity Check               │
├─────────────────────────────────────────────────────┤
│  Stage 3 │ Derivation & Content Verification        │
├─────────────────────────────────────────────────────┤
│  Stage 4 │ Pre-Publish Isolated Verification  ← MANDATORY
├─────────────────────────────────────────────────────┤
│  Stage 5 │ Documentation Linkage                    │
├─────────────────────────────────────────────────────┤
│  Stage 6 │ Release Gate (Final Approval)            │
├─────────────────────────────────────────────────────┤
│  Stage 7 │ Publish Execution                        │
└─────────────────────────────────────────────────────┘
          ↓
   Stage 8: Post-Publish Verification (SDKR-06)
```

---

## 5. Stage Definitions

### 5.1 Stage 0: Release Intent Declaration

**Purpose**: Prevent "accidental" or "drive-by" releases.

**Requirements**:
1. Explicitly list all packages to be released
2. Declare version change for each package (from → to)
3. State the reason for each version bump

**Evidence**: `RELEASE_INTENT.md`

**Checklist**:
- [ ] Package list declared
- [ ] Version changes declared (e.g., `@mplp/core 1.0.5 → 1.0.6`)
- [ ] Bump reason stated for each package

---

### 5.2 Stage 1: Version Legitimacy Validation

**Purpose**: Ensure version numbers are semantically justified.

**Rules**:

| Bump Type | Allowed For | Prohibited For |
|:---|:---|:---|
| PATCH | Bugfix, internal improvement, governance compliance | N/A |
| MINOR | New user-facing capability, new API surface | Fixing release mistakes |
| MAJOR | Breaking changes | N/A (requires protocol update) |

**Critical Rule**:
> **MINOR bumps to "fix a bad release" are PROHIBITED.**  
> If a release was wrong, bump PATCH and fix it properly.

**Evidence**: `VERSION_CHANGE_JUSTIFICATION.md`

**Checklist**:
- [ ] Each package's bump type declared (PATCH/MINOR)
- [ ] MINOR bumps have explicit capability description
- [ ] No "error correction" bumps to MINOR

---

### 5.3 Stage 2: Dependency Integrity Check

**Purpose**: Prevent silent coupling and cross-package drift.

**Requirements**:
1. Verify all `dependencies` in package.json/pyproject.toml
2. Confirm dependent packages satisfy semver constraints
3. Check for implicit dependency drift

**Evidence**: `DEPENDENCY_CHECK.md`

**Checklist**:
- [ ] Dependency versions checked
- [ ] No implicit cross-package breakage
- [ ] Internal dependencies (`file:../`) resolved for publish

---

### 5.4 Stage 3: Derivation & Content Verification

**Purpose**: Ensure package contents are governance-compliant.

**References**:
- METHOD-SDKR-02 (Derivation Rules)
- METHOD-SDKR-04 (Package Content Specification)

**Requirements**:
1. `DERIVATION_PROOF.yaml` present
2. Schema derivation traceable
3. Forbidden content scan PASS
4. Required files present: `dist/`, `README.md`, `LICENSE`

**Checklist**:
- [ ] DERIVATION_PROOF.yaml exists
- [ ] Forbidden content scan PASS
- [ ] Package structure compliant

---

### 5.5 Stage 4: Pre-Publish Isolated Verification (MANDATORY)

**Purpose**: Verify the exact artifact that will be published, in a clean environment.

> ⚠️ **THIS STAGE HAS NO EXCEPTIONS.**

**npm Verification**:
```bash
# 1. Pack the package
cd packages/npm/<pkg>
npm pack

# 2. Create isolated test environment
mkdir /tmp/verify-<pkg> && cd /tmp/verify-<pkg>
npm init -y

# 3. Install the tarball
npm install /path/to/<pkg>-<version>.tgz

# 4. Verify import
node -e "const pkg = require('@mplp/<pkg>'); console.log(Object.keys(pkg));"

# 5. Verify types (if TypeScript)
npx tsc --noEmit -p tsconfig.json  # with types imported
```

**PyPI Verification**:
```bash
# 1. Build
python3 -m build

# 2. Install wheel in isolation
pip install dist/<pkg>-<version>-py3-none-any.whl --force-reinstall

# 3. Verify import and version
python3 -c "import mplp; print(mplp.__version__)"
```

**Evidence**: `ISOLATED_VERIFICATION_REPORT.md`

**Checklist**:
- [ ] `npm pack` / `python -m build` executed
- [ ] Tarball/wheel installed in clean environment
- [ ] Import succeeds
- [ ] Types available (npm)
- [ ] Version matches expected

---

### 5.6 Stage 5: Documentation Linkage

**Purpose**: Prevent "publish first, document later".

**Requirements**:
1. `CHANGELOG.md` updated with new versions
2. Package `README.md` updated if behavior changed
3. `RELEASE_BUNDLE_MANIFEST.json` updated

**Rule**: Documentation updates MUST occur BEFORE publish, not after.

**Checklist**:
- [ ] CHANGELOG updated
- [ ] README updated (if applicable)
- [ ] Manifest updated

---

### 5.7 Stage 6: Release Gate (Final Approval)

**Purpose**: Human final review before irreversible publish.

**Requirements**:
1. All Stages 0-5 PASS
2. All evidence artifacts present
3. No unexplained version jumps (e.g., 1.0.5 → 1.1.0 without reason)

**Decision**: APPROVE or REJECT

**If REJECT**: Return to failed stage, fix, and restart from there.

**Checklist**:
- [ ] All previous stages PASS
- [ ] Evidence artifacts complete
- [ ] Release approved by responsible party

---

### 5.8 Stage 7: Publish Execution

**Purpose**: Execute the publish command.

**Rules**:
1. Only execute after Stage 6 approval
2. Command must be logged (CI or manual record)
3. Multi-package publishes follow order defined in SDKR-08

**Commands**:
```bash
# npm
npm publish --access public

# PyPI
twine upload dist/*
```

**Checklist**:
- [ ] Stage 6 approved
- [ ] Publish command executed
- [ ] Publish log recorded

---

## 6. Required Evidence Artifacts

| Stage | Artifact | Location |
|:---|:---|:---|
| 0 | `RELEASE_INTENT.md` | `artifacts/release/` |
| 1 | `VERSION_CHANGE_JUSTIFICATION.md` | `artifacts/release/` |
| 2 | `DEPENDENCY_CHECK.md` | `artifacts/release/` |
| 4 | `ISOLATED_VERIFICATION_REPORT.md` | `artifacts/release/` |
| 5 | `CHANGELOG.md` (diff) | Repository root |
| 6 | Release approval record | Git commit or PR |

---

## 7. Stage Failure Handling

| Failure | Action |
|:---|:---|
| Stage 0 incomplete | Cannot proceed |
| Stage 1 illegitimate version | Fix version, restart Stage 1 |
| Stage 2 dependency issue | Fix deps, restart Stage 2 |
| Stage 3 content issue | Fix content, restart Stage 3 |
| **Stage 4 verification fail** | **FIX AND RESTART. NO BYPASS.** |
| Stage 5 doc missing | Add docs, restart Stage 5 |
| Stage 6 rejected | Return to failed stage |

---

## 8. Integration with Existing METHODs

| METHOD | Relationship |
|:---|:---|
| SDKR-01 Pipeline | SDKR-09 executes between SDKR-01 Stage 4 and Stage 5 |
| SDKR-02 Derivation | Referenced in Stage 3 |
| SDKR-03 Versioning | Extended by Stage 1 |
| SDKR-04 Content | Referenced in Stage 3 |
| SDKR-06 Post-Install | Becomes Stage 8 (post-publish confirmation) |
| SDKR-08 Multi-Package | Stage 7 follows SDKR-08 publish order |

---

## 9. Non-Goals

This document does NOT define:
- How to write code
- API design guidelines
- Testing strategies
- CI/CD infrastructure

---

## 10. Amendment

Changes to this document require MPGC approval and a new frozen version.

---

**Document Status**: Governance Method  
**References**: METHOD-SDKR-01 through SDKR-08, CHECKLIST-SDK-RELEASE
