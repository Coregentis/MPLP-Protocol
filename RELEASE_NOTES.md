# MPLP v1.0.3 Release Notes

**Date**: 2025-12-06
**Protocol Version**: v1.0.0 (FROZEN)
**SDK Versions**:
- TypeScript: `v1.0.3`
- Python: `v1.0.0`

## Highlights
- **Protocol Frozen**: Core schemas and invariants are now frozen at v1.0.0.
- **Python SDK**: Complete Pydantic v2 implementation with strict schema alignment.
- **TypeScript SDK**: Stable reference implementation with full Golden Flow support.
- **MPLP-OPS**: Introduced operational framework for governance and release management.

## Changes
- **Docs**: Added `docs/14-ops/` with Release Runbook and OPS Overview.
- **Schemas**: Validated and aligned with both SDKs.
- **Examples**: Cleaned up `node_modules` and `dist` artifacts.

## Installation
```bash
npm install @mplp/sdk-ts@1.0.3
pip install mplp-sdk==1.0.0
```

## Resources
- [Documentation](https://coregentis.github.io/MPLP-Protocol/)
- [Governance](GOVERNANCE.md)