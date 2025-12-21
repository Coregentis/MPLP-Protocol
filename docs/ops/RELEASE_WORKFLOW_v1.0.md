# MPLP — Unified Release Workflow (NPM + PyPI)

**Version:** v1.0 (Protocol-Grade)
**Status:** FROZEN
**Governance:** MPGC
**Date:** 2025-12-21

---

## 1. Repository Layout

```
packages/
├── sources/                    # Build Sources (dev workspace)
│   ├── sdk-ts/                # TypeScript SDK source
│   └── sdk-py/                # Python SDK source
│
├── npm/                        # Publish Sources (NPM)
│   ├── core/                  # @mplp/core
│   └── coordination/          # @mplp/coordination
│
└── pypi/                       # Publish Sources (PyPI)
    └── mplp-sdk/              # mplp-sdk
```

---

## 2. Mandatory Rules (Non-Negotiable)

1. ❌ **NEVER publish from `packages/sources/` directly**
2. ✅ All publish must follow: `sources → sync → gates → publish`
3. ✅ Publish sources must contain canonical metadata (from baseline)
4. ✅ **Terminology**: All READMEs must use "Agent OS Protocol" (see `docs/ops/TERMINOLOGY_STANDARD_v1.0.md`)
5. ✅ Publish order: @mplp/core → @mplp/coordination → mplp-sdk
6. ⛔ **R-3 Governance Release**: Version bump is **FORBIDDEN by default**. Bulk republish requires MPGC approval.

---

## 3. Canonical Metadata Baseline

**Source of Truth:** `docs/ops/PACKAGE_METADATA_BASELINE.yaml`

| Field | Value |
|:---|:---|
| License | `Apache-2.0` |
| Author | `Coregentis AI` |
| Homepage | `https://mplp.io` |
| Documentation | `https://docs.mplp.io` |
| Repository | `https://github.com/Coregentis/MPLP-Protocol` |
| Issues | `https://github.com/Coregentis/MPLP-Protocol/issues` |
| Keywords | `mplp, multi-agent, lifecycle, protocol, agent-os` |
| Copyright | `© 2025 Bangshi Beijing Network Technology Limited Company` |

---

## 4. Release Stages

### Stage A: Validate Build Source

```bash
# TypeScript
cd packages/sources/sdk-ts
rm -rf dist node_modules
npm install && npm run build && npm test

# Python
cd packages/sources/sdk-py
rm -rf dist build *.egg-info
python -m build
python -m pytest
```

### Stage B: Sync to Publish Source

```bash
node scripts/release/sync-publish-sources.js
```

**Script must:**
- Copy source files
- Inject canonical metadata
- Validate version coherence
- Output `RELEASE_SYNC_REPORT.json`

### Stage C: Artifact Gates (MUST PASS)

#### NPM Gates (core/coordination)

**Gate N1 — Packaging manifest**
```bash
cd packages/npm/core
npm pack --dry-run
```

**Gate N2 — Artifact content scan (CRITICAL)**
```powershell
# Windows PowerShell
$TGZ = npm pack
$TMPDIR = New-TemporaryFile | ForEach-Object { Remove-Item $_; mkdir $_ }
tar -xzf $TGZ -C $TMPDIR

# Fail if dist contains monorepo path assumptions
$dangerous = Get-ChildItem -Recurse "$TMPDIR\package\dist\*.js" | 
  Select-String -Pattern "schemas/v2|__dirname.*\.\./\.\./\.\./\.\./schemas"
if ($dangerous) { 
  Write-Error "GATE FAILED: Dangerous paths found"
  exit 1 
}
Write-Host "GATE N2 PASSED: No dangerous paths"
```

**Gate N3 — Metadata alignment**
```bash
node -e "
const p=require('./package.json');
const must={homepage:'https://mplp.io',license:'Apache-2.0'};
for(const[k,v]of Object.entries(must)){
  if(p[k]!==v)throw new Error(k+' mismatch: '+p[k]);
}
console.log('METADATA OK');
"
```

#### PyPI Gates (mplp-sdk)

**Gate P1 — Build**
```bash
cd packages/pypi/mplp-sdk
python -m build
```

**Gate P2 — Twine validation**
```bash
python -m twine check dist/*
```

**Gate P3 — Wheel content sanity**
```python
import zipfile, glob
whls = glob.glob("dist/*.whl")
assert whls, "no wheel found"
z = zipfile.ZipFile(sorted(whls)[-1])
names = z.namelist()
bad = [n for n in names if n.startswith("tests/") or "/tests/" in n]
if bad:
    raise SystemExit(f"wheel contains test paths: {bad[:10]}")
print(f"WHEEL OK: {len(names)} files")
```

---

## 5. Publish Commands

### NPM (in order)

```bash
# 1. Core first
cd packages/npm/core
npm publish --access public

# 2. Coordination second (depends on core)
cd ../coordination
npm publish --access public
```

### PyPI

```bash
cd packages/pypi/mplp-sdk
python -m build
python -m twine check dist/*
python -m twine upload dist/*
```

---

## 6. Post-Release Verification (MANDATORY)

### Consumer Install Test

```bash
mkdir -p /tmp/mplp-verify && cd /tmp/mplp-verify
npm init -y
npm install @mplp/core@1.0.3 @mplp/coordination@1.0.3

node -e "
const core = require('@mplp/core');
console.log('validateContext:', core.validateContext({}));
"
# Expected: { ok: true, errors: [] }

pip install mplp-sdk==1.0.1
python -c "import mplp; print('version:', mplp.__version__)"
# Expected: 1.0.1
```

---

## 7. Version Rules

| Change | Bump | Example |
|:---|:---|:---|
| Bug fix | PATCH | 1.0.2 → 1.0.3 |
| Feature | MINOR | 1.0.3 → 1.1.0 |
| Breaking | MAJOR | 1.1.0 → 2.0.0 |

**Note:** MPLP Protocol v1.0.0 is FROZEN. Only PATCH allowed.

**R-3 Governance / Metadata Release Rules:**
- **Definition**: Changes to README, Metadata, License, or Governance docs ONLY.
- **Rule**: Do **NOT** bump version. Republish existing version if registry allows (unlikely for NPM/PyPI) or skip publish.
- **Exception**: If registry forces version bump for metadata update, explicit MPGC approval is required.
- **Bulk Operation**: Bulk version bumping for governance alignment is **restricted**.

---

## 8. Evidence Chain

Each release must produce:

1. `RELEASE_SYNC_REPORT.json` — Sync script output
2. Gate pass logs (N1/N2/N3, P1/P2/P3)
3. `npm info` / `pip show` post-publish verification

---

**MPGC 2025-12-21**
