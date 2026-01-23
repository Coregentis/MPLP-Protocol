---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-04_PACKAGE_CONTENT_SPEC"
---

# METHOD-SDKR-04: Package Content Specification

**Document ID**: METHOD-SDKR-04  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines exactly what MUST and MUST NOT be included in SDK packages.

---

## 2. TypeScript SDK Package

### 2.1 Required Contents

| Path | Description |
|:---|:---|
| `dist/` | Compiled JavaScript + type definitions |
| `src/` | Source TypeScript (optional) |
| `package.json` | Package manifest |
| `README.md` | Usage documentation |
| `LICENSE` | Apache 2.0 |
| `RELEASE_MANIFEST.json` | Evidence binding (mandatory) |
| `DERIVATION_PROOF.yaml` | Schema derivation proof (mandatory) |

### 2.2 Forbidden Contents (MANDATORY EXCLUSION LIST)

SDK package MUST NOT contain ANY of the following:

| Path Pattern | Reason | Scan Result |
|:---|:---|:---:|
| `governance/**` | Governance files | REJECT if found |
| `_manifests/**` | Evidence artifacts | REJECT if found |
| `schemas/v2/**` (raw) | Truth Source files | REJECT if found |
| `*.md` (protocol specs) | Normative documents | REJECT if found |
| `**/helpers/*` (undeclared) | Traceability loss | REJECT if found |
| `**/utils/*` (undeclared) | Traceability loss | REJECT if found |
| `tests/**` | Test fixtures | REJECT if found |
| `.git/**` | Version control | REJECT if found |

### 2.3 Forbidden Content Scan (CI Gate)

Before release, a forbidden content scan MUST be executed:

```bash
# TypeScript
npm pack --dry-run 2>&1 | grep -E "(governance|_manifests|schemas/v2)" && exit 1

# Python
python -c "import tarfile; [print(f) for f in tarfile.open('dist/*.whl').getnames() if 'governance' in f or '_manifests' in f]"
```

**Any match = RELEASE BLOCKED**

---

## 3. Python SDK Package

### 3.1 Required Contents

| Path | Description |
|:---|:---|
| `src/mplp/` | Package source |
| `src/mplp/generated/` | Schema-derived types |
| `pyproject.toml` | Package metadata |
| `README.md` | Usage documentation |
| `LICENSE` | Apache 2.0 |
| `RELEASE_MANIFEST.json` | Evidence binding (mandatory) |
| `DERIVATION_PROOF.yaml` | Schema derivation proof (mandatory) |

### 3.2 Forbidden Contents

| Path | Reason |
|:---|:---|
| `_manifests/` | Governance artifact |
| `governance/` | Governance files |
| Schema JSON files | Unless declared |
| Test fixtures | Not distribution content |

---

## 4. README Requirements

SDK README MUST include:

- Protocol version compatibility
- Installation instructions
- Import verification example
- Link to official documentation

SDK README MUST NOT include:

- Protocol specification content
- Schema definitions
- Governance rules

---

## 5. Provenance Requirement

Every file in the package MUST be traceable to:

- Truth Source schema
- Approved generator
- Standard boilerplate (LICENSE, etc.)

Files without provenance = **governance-illegal**.

---

## 6. Required Package Layout

This section defines the exact file layout of published packages.

### 6.1 TypeScript SDK (npm tarball)

The published npm package MUST contain exactly:

```
package/
├── package.json          # REQUIRED
├── README.md             # REQUIRED
├── LICENSE               # REQUIRED
├── RELEASE_MANIFEST.json # REQUIRED
├── dist/
│   ├── index.js          # REQUIRED
│   ├── index.d.ts        # REQUIRED
│   ├── types/            # REQUIRED (generated types)
│   └── enums/            # REQUIRED (enum literals)
└── src/                  # OPTIONAL (source files)
```

### 6.2 Python SDK (wheel/sdist)

The published Python package MUST contain exactly:

```
mplp-{version}/
├── pyproject.toml        # REQUIRED
├── README.md             # REQUIRED
├── LICENSE               # REQUIRED
├── RELEASE_MANIFEST.json # REQUIRED
└── src/
    └── mplp/
        ├── __init__.py   # REQUIRED
        ├── models/       # REQUIRED
        ├── generated/    # REQUIRED (schema-derived)
        └── validation.py # REQUIRED
```

### 6.3 Missing File Ruling

| Missing File | Ruling |
|:---|:---:|
| RELEASE_MANIFEST.json | REJECT |
| README.md | REJECT |
| LICENSE | REJECT |
| generated types/enums | REJECT |
| Optional source files | ALLOWED |

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-02, METHOD-SDKR-08

---

## 7. Multi-Package Mode

When releasing multiple `@mplp/*` packages:

- Each package MUST independently satisfy all requirements in this document
- Bundle-level artifacts are governed by METHOD-SDKR-08
- See METHOD-SDKR-08 for package classification and version synchronization rules
