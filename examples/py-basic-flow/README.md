# Python Basic Flow Example

This example demonstrates the **currently published Python package surface** for MPLP.

At the moment, `mplp-sdk` is a placeholder package that exposes version and protocol
binding metadata, not a full Python SDK builder/runtime API.

## Setup

```bash
cd packages/sources/sdk-py
python -m venv .venv
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -e .
```

## Running the Example

```python
import mplp

print("Package version:", mplp.__version__)
print("Protocol binding:", mplp.MPLP_PROTOCOL_VERSION)
```

## Testing

```bash
cd <repo-root>
# Set PYTHONPATH to include the source-side mirror package
# Windows (PowerShell):
$env:PYTHONPATH="packages/sources/sdk-py/src"
# Linux/Mac:
export PYTHONPATH="packages/sources/sdk-py/src"

python3 -c "import mplp; print(mplp.__version__)"
```

## Next Steps

- For the currently published surface, use `import mplp` and verify package/version binding.
- A richer Python SDK/runtime surface would require a future package release.


---
**License**: [Apache 2.0](../../LICENSE.txt)
