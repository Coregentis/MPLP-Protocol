---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-08_MULTI_PACKAGE_RELEASE_GOVERNANCE"
---

# METHOD-SDKR-08: Multi-Package Release Governance

**Document ID**: METHOD-SDKR-08  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines governance rules for releasing multiple packages under the `@mplp/*` namespace as a coordinated bundle.

It extends METHOD-SDKR-01~07 to support the multi-package monorepo release model.

---

## 2. Package Classification

All packages under `@mplp/*` MUST be classified into one of the following categories:

| Category | Definition | Publish Allowed |
|:---|:---|:---:|
| `PUBLIC` | External distribution package | YES |
| `INTERNAL` | Development-time dependency | NO |
| `CI-ONLY` | CI gate tool, never published | NO |

### 2.1 Category Enforcement

| Category | package.json Requirements |
|:---|:---|
| `PUBLIC` | `"private": false` or absent |
| `INTERNAL` | `"private": true` |
| `CI-ONLY` | `"private": true` + `"mplp.ci_only": true` + `"mplp.publishBlocked": true` |

---

## 3. Current Package Registry

| Package | Category | Layer |
|:---|:---|:---|
| `@mplp/core` | PUBLIC | L1 |
| `@mplp/schema` | PUBLIC | L1 |
| `@mplp/modules` | PUBLIC | L2 |
| `@mplp/coordination` | PUBLIC | L2 |
| `@mplp/conformance` | PUBLIC | L2 (Conformance Kit) |
| `@mplp/runtime-minimal` | PUBLIC | L3 |
| `@mplp/devtools` | PUBLIC | Tool |
| `@mplp/sdk-ts` | PUBLIC | Facade |
| `@mplp/integration-storage-kv` | PUBLIC | L4 |
| `@mplp/integration-storage-fs` | PUBLIC | L4 |
| `@mplp/integration-llm-http` | PUBLIC | L4 |
| `@mplp/validator` | CI-ONLY | Tool |

### 3.1 Legacy Package

| Package | Status | Migration |
|:---|:---|:---|
| `@mplp/compliance` | DEPRECATED | Use `@mplp/conformance` |

---

## 4. Version Synchronization Rules

### V-SYNC-01: Bundle Version Consistency

All `@mplp/*` packages in a release bundle MUST share the same **major.minor** version.

```
VALID:   @mplp/core@1.0.5, @mplp/schema@1.0.5, @mplp/sdk-ts@1.0.5
INVALID: @mplp/core@1.0.5, @mplp/schema@1.1.0
```

### V-SYNC-02: Facade Dependency Alignment

The `@mplp/sdk-ts` facade package MUST depend on core packages with **exact** or **caret** version matching its own version.

### V-SYNC-03: Bundle Manifest Required

Every release MUST include a `RELEASE_BUNDLE_MANIFEST.json` that records:
- All packages included in the release
- Version of each package
- Dependency graph snapshot
- Evidence baseline reference

---

## 5. Release Unit Definitions

### 5.1 Package Unit

A single `@mplp/*` package that:
- Has its own `package.json`
- Has its own `DERIVATION_PROOF.yaml`
- Passes individual package content spec (METHOD-SDKR-04)

### 5.2 Release Bundle

A coordinated set of Package Units that:
- Share the same major.minor version
- Reference the same Evidence Baseline
- Are released together in a single CI run

---

## 6. Publish Gate Requirements

### 6.0 Set Definitions

| Set | Definition |
|:---|:---|
| **Workspace Set** | All packages in monorepo |
| **Release Bundle Set** | Packages coordinated for this version (may include INTERNAL/CI-ONLY for verification) |
| **Publish Set** | Packages to be published to npm/PyPI (MUST be PUBLIC only) |

Before any package publish:

### 6.1 Package-level check (MANDATORY)

For each package in **Publish Set**:

| Check | Missing = |
|:---|:---:|
| `DERIVATION_PROOF.yaml` exists and validates | **FAIL** |
| Content spec (METHOD-SDKR-04) passes | **FAIL** |

### 6.2 Bundle-level check (MANDATORY)

| Check | Missing = |
|:---|:---:|
| Version sync rules (V-SYNC-01/02/03) pass | **FAIL** |
| `RELEASE_BUNDLE_MANIFEST.json` generated | **FAIL** |
| All packages in Publish Set are PUBLIC category | **FAIL** |

### 6.3 Denylist check (HARD BLOCK - NO WAIVER)

The following conditions on **Publish Set** cause immediate failure:

| Condition | Result |
|:---|:---:|
| Any `mplp.ci_only === true` package in Publish Set | **IMMEDIATE FAIL** |
| Any `mplp.publishBlocked === true` package in Publish Set | **IMMEDIATE FAIL** |
| Any `private: true` package in Publish Set | **IMMEDIATE FAIL** |
| Any CI-ONLY or INTERNAL category package in Publish Set | **IMMEDIATE FAIL** |

> **Note:** CI-ONLY and INTERNAL packages MAY exist in Release Bundle Set (for verification purposes) but MUST NOT enter Publish Set.

### 6.4 Automated Gate Script (REQUIRED)

The publish pipeline MUST include an automated gate script at `scripts/semantic/gate-publish-set.mjs`:

```javascript
// Gate: Verify Publish Set contains only PUBLIC packages
// Output: artifacts/release/publish-gate-report.json

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const PACKAGES_DIR = 'packages/npm';
const OUTPUT_DIR = 'artifacts/release';

function gatePublishSet() {
  const packages = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  const publishSet = [];
  const blocked = [];
  
  for (const pkg of packages) {
    const pkgJsonPath = join(PACKAGES_DIR, pkg, 'package.json');
    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    
    const isPrivate = pkgJson.private === true;
    const isCiOnly = pkgJson.mplp?.ci_only === true;
    const isPublishBlocked = pkgJson.mplp?.publishBlocked === true;
    
    if (isPrivate || isCiOnly || isPublishBlocked) {
      blocked.push({ name: pkgJson.name, reason: { isPrivate, isCiOnly, isPublishBlocked } });
    } else {
      publishSet.push({ name: pkgJson.name, version: pkgJson.version });
    }
  }
  
  // Check for violations: blocked packages should not be in publish flow
  const violations = blocked.filter(b => 
    process.argv.includes('--publish-all') || 
    process.argv.includes(b.name)
  );
  
  mkdirSync(OUTPUT_DIR, { recursive: true });
  
  const report = {
    timestamp: new Date().toISOString(),
    publishSet,
    blocked,
    violations,
    status: violations.length === 0 ? 'PASS' : 'FAIL'
  };
  
  writeFileSync(join(OUTPUT_DIR, 'publish-gate-report.json'), JSON.stringify(report, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'publish-set.json'), JSON.stringify(publishSet, null, 2));
  
  if (violations.length > 0) {
    console.error('FATAL: Blocked packages in publish flow:', violations);
    process.exit(1);
  }
  
  console.log('Gate PASS. Publish Set:', publishSet.map(p => p.name).join(', '));
}

gatePublishSet();
```

**This gate is NOT waivable. Violation = Release blocked + Incident record required.**

### 6.5 Evidence Artifacts

Each release MUST produce:

| Artifact | Location | Required |
|:---|:---|:---:|
| `RELEASE_BUNDLE_MANIFEST.json` | `artifacts/release/` | YES |
| `publish-set.json` | `artifacts/release/` | YES |
| `publish-gate-report.json` | `artifacts/release/` | YES |

### 6.6 Hash Evidence Strategy

MPLP SDK releases produce a **cryptographically verifiable evidence bundle before publication**.

#### 6.6.1 Pre-Publish Hash Requirements (MANDATORY)

| Artifact Type | Hash Algorithm | Recording Location |
|:---|:---|:---|
| Python wheel (.whl) | SHA-256 | `DERIVATION_PROOF.yaml` |
| Python sdist (.tar.gz) | SHA-256 | `DERIVATION_PROOF.yaml` |
| npm tarball | Registry SSRI | Implicit (registry contract) |

#### 6.6.2 Hash Verification Points

| Phase | Verification | Required |
|:---|:---|:---:|
| Build | Compute artifact hash | **YES** |
| Gate | Verify hash recorded | **YES** |
| Bundle | Include in manifest | **YES** |
| Post-Publish | Re-validate from registry | **NO** |

#### 6.6.3 Registry Immutability Contract

Once published, packages are **immutable by registry contract**:

- npm: Cannot overwrite published version
- PyPI: Cannot overwrite published version

Post-publish hash re-validation is **explicitly not required** in v1.0.

#### 6.6.4 Out of Scope (v1.0)

The following are **NOT required** in v1.0:

- GPG signing
- Sigstore / SLSA attestations
- npm provenance
- PyPI attestations
- Post-publish registry API hash verification

These belong to **future Supply Chain Security RFC**, not SDK Release Governance.

### 6.7 Version Verification (MANDATORY)

Before every publish, package versions MUST be verified against registry.

#### 6.7.1 npm Version Check

```bash
# For each package in Publish Set:
npm view @mplp/<package> version 2>/dev/null || echo "NEW"
```

If current version ≤ published version → **FAIL** (must bump)

#### 6.7.2 PyPI Version Check

```bash
pip index versions mplp-sdk 2>/dev/null || echo "NEW"
```

If current version ≤ published version → **FAIL** (must bump)

#### 6.7.3 Version Bump Rules

| Condition | Required Action |
|:---|:---|
| Package already published at this version | **MUST bump patch+** |
| Package is new (never published) | Use initial version |
| Version mismatch with bundle | **FAIL gate** |

### 6.8 Version Alignment Procedure (MANDATORY)

Before any release, version alignment MUST be performed:

#### 6.8.1 Fetch Registry Versions

For each package in Publish Set, query the registry for current latest version:

```bash
# npm
curl -s "https://registry.npmjs.org/@mplp%2F<package>" | grep -o '"latest":"[^"]*"'

# PyPI
curl -s "https://pypi.org/pypi/<package>/json" | grep -o '"version":"[^"]*"'
```

#### 6.8.2 Version Bump Calculation

| Registry Status | Action |
|:---|:---|
| NOT FOUND | Use initial version (1.0.0 for new packages) |
| Version exists | Bump to (current_patch + 1), e.g., 1.0.5 → 1.0.6 |

**MINOR/MAJOR bumps require protocol change or new functionality.**

#### 6.8.3 Required Document Updates

When version changes, the following MUST be updated:

| Document | Location | Update Content |
|:---|:---|:---|
| `package.json` | `packages/npm/<pkg>/` | `version` field |
| `pyproject.toml` | `packages/pypi/<pkg>/` | `version` field |
| `DERIVATION_PROOF.yaml` | Each package | `package.version` field |
| `CHANGELOG.md` | Repository root | New release entry with all package versions |
| `RELEASE_BUNDLE_MANIFEST.json` | `artifacts/release/` | Package versions and hashes |

#### 6.8.4 Copyright Year Alignment

All copyright notices MUST reflect the current year (e.g., `© 2026`).

### 6.9 Pre-Publish Local Verification (MANDATORY)

**All packages MUST be verified locally BEFORE registry publication.**

Post-publish verification (Phase 7) confirms registry deployment only.

#### 6.9.1 npm Local Verification

```bash
# Step 1: Pack
cd packages/npm/<pkg>
npm pack

# Step 2: Install in clean temp directory
mkdir /tmp/verify-npm && cd /tmp/verify-npm
npm init -y
npm install /path/to/<pkg>-<version>.tgz

# Step 3: Verify import
node -e "const pkg = require('@mplp/<pkg>'); console.log('Import OK');"
```

#### 6.9.2 PyPI Local Verification

```bash
# Install wheel
pip install /path/to/mplp_sdk-<version>-py3-none-any.whl --force-reinstall

# Verify import and version
python3 -c "import mplp; print(f'Version: {mplp.__version__}')"
```

#### 6.9.3 Local Verification Failure = Release Blocked

If ANY local verification fails:
- **DO NOT PROCEED** to Registry Publish
- Fix the issue, rebuild, and re-verify

---

## 7. Deprecation Procedure

To deprecate a package:

1. Update package README with migration instructions
2. Update package description to include "Legacy"
3. After publish, execute: `npm deprecate @mplp/<package>@"<version-range>" "<message>"`
4. Record deprecation in this document (Section 3.1)

---

## 8. Language Profiles

### 8.1 Python Profile (PyPI Release Governance)

#### 8.1.1 Scope

This section defines the **Python (PyPI) release governance profile** under METHOD-SDKR-08.

It specifies the mandatory governance requirements for releasing Python SDK artifacts that are part of an MPLP Release Bundle.

This profile **does not introduce a separate governance method**.
All Python releases remain subject to the same authority, versioning, and evidence principles defined in METHOD-SDKR-08.

---

#### 8.1.2 Python Package Classification

All Python packages included in a Release Bundle MUST be classified using the same conceptual categories defined in Section 2:

| Category | Definition | PyPI Upload Allowed |
|:---|:---|:---:|
| `PUBLIC` | External Python SDK or runtime package | YES |
| `INTERNAL` | Development-only or tooling package | NO |
| `CI-ONLY` | CI or validation tooling | NO |

Python packages in the `INTERNAL` or `CI-ONLY` categories MUST NOT be uploaded to PyPI under any circumstance.

**Current Python Package Registry:**

| Package | Category | Layer | PyPI Name |
|:---|:---|:---|:---|
| `mplp-sdk` | PUBLIC | SDK + Runtime | `mplp-sdk` |

---

#### 8.1.3 Python Package Unit Requirements

Each Python Package Unit included in a Release Bundle MUST satisfy all of the following:

1. A valid `pyproject.toml` defining:
   - package name
   - version
   - license
   - build backend

2. A corresponding `DERIVATION_PROOF.yaml` documenting:
   - truth source paths
   - build inputs
   - artifact hashes (sdist and wheel)

3. A `[tool.mplp]` section in `pyproject.toml` with:
   - `protocolVersion`
   - `frozen`
   - `governance`

4. Successful build of at least:
   - one source distribution (`sdist`)
   - one wheel distribution (`wheel`)

Failure to meet any requirement SHALL block the release.

---

#### 8.1.4 Python Version Synchronization

All Python packages included in a Release Bundle MUST:

- Use the **same major.minor version** as the Release Bundle
- Match the version recorded in `RELEASE_BUNDLE_MANIFEST.json`

Any mismatch between Python package version and Release Bundle version SHALL result in an immediate release failure.

---

#### 8.1.5 Python Publish Set and Gate (REQUIRED)

A Python Publish Set MUST be computed automatically by CI.

Manual specification of publish targets is NOT permitted.

Before any PyPI upload occurs, an automated gate MUST verify:

| Condition | Violation Result |
|:---|:---:|
| Package not classified as `PUBLIC` | **FAIL** |
| Missing `DERIVATION_PROOF.yaml` | **FAIL** |
| Version mismatch with Release Bundle | **FAIL** |
| Missing sdist or wheel artifact | **FAIL** |
| Artifact hash not recorded | **FAIL** |

This gate is **NOT waivable**.

---

#### 8.1.6 Python Evidence Artifacts

Each Python release MUST generate the following artifacts:

| Artifact | Location | Required |
|:---|:---|:---:|
| `pypi-set.json` | `artifacts/release/` | YES |
| `pypi-gate-report.json` | `artifacts/release/` | YES |
| Python entries in `RELEASE_BUNDLE_MANIFEST.json` | — | YES |

These artifacts form part of the Evidence Chain for the Release Bundle.

---

#### 8.1.7 Deprecation and Yank Policy (Python)

Deprecation or yank actions on PyPI are governed as follows:

- Any deprecation MUST be documented in release notes and governance records
- Yank operations are classified as **high-impact actions** and REQUIRE:
  - explicit incident record
  - governance approval
  - evidence annotation

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: METHOD-SDKR-01, METHOD-SDKR-04, METHOD-SDKR-05
