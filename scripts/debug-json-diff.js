/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const fs = require('fs');
const path = require('path');

const tsPath = path.join(__dirname, '../tests/cross-language/builders/out/ts/single-agent.json');
const pyPath = path.join(__dirname, '../tests/cross-language/builders/out/py/single-agent.json');

const tsData = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
const pyData = JSON.parse(fs.readFileSync(pyPath, 'utf-8'));

console.log("TS Keys:", Object.keys(tsData));
console.log("PY Keys:", Object.keys(pyData));

console.log("\nTS Context Keys:", Object.keys(tsData.context).sort());
console.log("PY Context Keys:", Object.keys(pyData.context).sort());

console.log("\nTS Trace Keys:", Object.keys(tsData.trace).sort());
console.log("PY Trace Keys:", Object.keys(pyData.trace).sort());

console.log("\nTS root_span Keys:", Object.keys(tsData.trace.root_span).sort());
console.log("PY root_span Keys:", Object.keys(pyData.trace.root_span).sort());
