# How to Use the UI/UX SSOT Projection Map

The [UI/UX SSOT Projection Map](/docs/reference/uiux-projections/UIUX-MAP-v0.9-v0.17.md) is a non-normative tool designed to help auditors navigate the Validation Lab's evolution and locate key evidence pointers.

## 1. Locating Evidence via Anchors
Each version mapping in the [JSON Data](https://docs.mplp.io/meta/rulesets/uiux-route-map.v0.9-v0.17.json) includes `anchor_refs`. These are JSON paths pointing to the exact field in `lab-manifest.json` where the evidence hash is anchored.

**Example**:
To find the MUST-1 Domain Breadth proof for v0.15.1:
1.  Look up `v0.15.1` in the Map.
2.  Find the `manifest_hash_ref`: `anchors.shipyard_v15.matrix_sha256`.
3.  Verify this hash against the local `lab-manifest.json` in your cloned repository.

## 2. Deep-Link Navigation
The `routes` array provides stable, site-relative paths to key Lab pages:
*   `/validation`: The central hub for structural integrity.
*   `/validation/samples`: The MUST-1 same-scale evidence pairs.
*   `/rulesets/evolution`: The MUST-3 logic evolution diffs.

## 3. Interpreting Evidence Pointers
Pointers in the map use standardized types:
*   `canonptr:v1`: Canonical pointer to a specific release purity proof.
*   `diffpack`: Machine-verifiable ruleset evolution package.
*   `event`: Deep-link to a forensic event within an evidence pack timeline.

---
*Note: This map is a derived projection and does not replace the authoritative SSOT stored in the Lab repository.*
