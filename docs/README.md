# MPLP Documentation Site

This directory is the private source workspace for **docs.mplp.io**, MPLP's
official **specification/reference projection** surface.

Live site:

- `https://docs.mplp.io`
- canonical entry anchor: `https://docs.mplp.io/docs/reference/entrypoints`

## Surface Role

Documentation is part of MPLP's 3+1 public-surface model:

- **Repository**: protocol/source truth
- **Documentation**: specification/reference projection
- **Website**: discovery and positioning
- **Validation Lab**: evidence adjudication

This workspace does not define protocol truth independently of the repository.
Repository-backed schemas, invariants, and approved governance records remain
the upstream truth sources projected here.

## Version Context

- `protocol_version`: `1.0.0`
- `docs_release_version`: `1.0.0`

Use explicit version domains for outward-facing interpretation. This workspace's
package metadata and local tooling do not replace canonical version-domain
meaning.

## Local Development

```bash
npm install
npm run start
```

## Build

```bash
npm run build
```

This generates the local static output into `build/`.

## Deployment Boundary

Deployment details are repository-managed operational concerns. This README is a
landing/pointer surface, not a release authority record.
