---
sidebar_position: 2

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Guide to the current published mplp-sdk Python helper package surface."
title: Python SDK Guide
---

# Python SDK Guide

## 1. Current Package State

The published **`mplp-sdk`** package is currently a **minimal Python protocol
helper surface**.

It is installable from PyPI, version-bound to the frozen protocol line, and it
does **not** present a full Python SDK or runtime.

**PyPI Package**: [`mplp-sdk`](https://pypi.org/project/mplp-sdk/)

## 2. Installation

```bash
pip install mplp-sdk
```

## 3. Current Published Surface

The current shipped package surface includes:

- `mplp.__version__`
- `mplp.MPLP_PROTOCOL_VERSION`
- `mplp.KERNEL_DUTIES`
- `mplp.KERNEL_DUTY_IDS`
- `mplp.KERNEL_DUTY_NAMES`
- `mplp.KERNEL_DUTY_COUNT`

Example:

```python
import mplp

print(mplp.__version__)
print(mplp.MPLP_PROTOCOL_VERSION)
print(mplp.KERNEL_DUTY_COUNT)
```

## 4. Source and Publish Surfaces

| Surface | Path | Role |
|:---|:---|:---|
| Source-side mirror | `packages/sources/sdk-py/` | Build/release preparation mirror |
| Public PyPI package | `packages/pypi/mplp-sdk/` | Published helper package |

## 5. Boundary

The current Python package does **not** provide:

- generated Python models
- runtime orchestration APIs
- validation/builders comparable to the TypeScript package family
- a full Python SDK/runtime surface

If that package surface expands in the future, the package metadata, published
exports, and docs guidance must expand together.

## 6. Kernel Duty Baseline

The package now carries the 11-duty baseline as exported Python constants.

Canonical upstream sources remain:

- `schemas/v2/taxonomy/kernel-duties.yaml`
- `governance/05-specialized/entity.json`

The package is therefore a helper mirror of that baseline, not the source of
truth for it.

## 7. Requirements

- Python >= 3.9
- no required runtime dependencies for the current helper surface

---

**Final Boundary**: `mplp-sdk` is currently a minimal published helper package,
not a full SDK or runtime contract surface.
