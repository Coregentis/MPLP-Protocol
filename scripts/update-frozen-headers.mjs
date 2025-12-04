import fs from "fs";
import path from "path";

// ------------------------------------------------------------
// MPLP v1.0.x File-Level Governance Standards
// ------------------------------------------------------------

const FROZEN_MD_BLOCK = `> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.`;

const COPYRIGHT_FOOTER = `
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.`;

const SOURCE_HEADER = `/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */`;

const YAML_HEADER = `# MPLP v1.0.0 FROZEN – Invariant Set
# © 2025 邦士（北京）网络科技有限公司 – Apache-2.0
# Governance: MPLP Protocol Governance Committee (MPGC)`;

const JSON_COMMENT = "MPLP v1.0.0 FROZEN – © 2025 邦士（北京）网络科技有限公司 – Apache-2.0 – Governance: MPGC";

const JSON_META_BASE = {
  "protocolVersion": "1.0.0",
  "frozen": true,
  "freezeDate": "2025-12-03",
  "governance": "MPGC"
};

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function read(f) { return fs.readFileSync(f, 'utf8'); }
function write(f, c) { fs.writeFileSync(f, c, 'utf8'); console.log('Updated:', f); }

// ------------------------------------------------------------
// Processors
// ------------------------------------------------------------

function processMarkdown(filePath) {
  let content = read(filePath);

  // Determine file type
  // Normative: docs/00 to docs/07
  const isNormative = /docs[\\\/]0[0-7]-/.test(filePath);

  // Governance & Root: README, CHANGELOG, Governance docs
  const isGovernance = /CODE_OF_CONDUCT|CONTRIBUTING|SECURITY|GOVERNANCE|MAINTAINERS/.test(filePath);
  const isRoot = /README\.md|CHANGELOG\.md|LICENSE\.txt/.test(filePath);

  // Other Docs: docs/08+, docs/99
  const isOtherDocs = /docs[\\\/](0[8-9]|1[0-9]|99)-/.test(filePath);

  // 1. Remove OLD Frozen Headers (YAML style)
  content = content.replace(/^---[\r\n]+MPLP Protocol: v1.0.0[\s\S]*?---[\r\n]+/, '');

  // 2a. Remove Manual Markdown Headers (bold text style)
  content = content.replace(/^---[\r\n]+\*\*MPLP Protocol 1\.0\.0 — Frozen Specification\*\*[\s\S]*?requires a new protocol version\.\*\*[\r\n]+/, '');
  content = content.replace(/^\*\*MPLP Protocol 1\.0\.0 — Frozen Specification\*\*[\s\S]*?requires a new protocol version\.\*\*[\r\n]+/, '');

  // 2b. Remove NEW Frozen Headers (Blockquote style) to prevent duplication
  content = content.replace(/^> \[!FROZEN\][\s\S]*?> \*\*Note\*\*:.*?\n\n?/m, '');

  // 3. Remove Existing Footer (to prevent duplication)
  content = content.replace(/[\r\n]+---[\r\n]+© 2025 邦士（北京）网络科技有限公司[\s\S]*?Version 2.0\.[\r\n]*/, '');

  // 4. Apply Frozen Header (ONLY for Normative)
  if (isNormative) {
    content = FROZEN_MD_BLOCK + "\n\n" + content.trimStart();
  }

  // 5. Apply Footer (For all public docs except maybe templates)
  // We apply to Normative, Governance, Root, and Other Docs.
  if (isNormative || isGovernance || isRoot || isOtherDocs) {
    content = content.trimEnd() + COPYRIGHT_FOOTER + "\n";
  }

  write(filePath, content);
}

function processJsonSchema(filePath) {
  // Only for schemas/v2
  if (!filePath.includes('schemas/v2') && !filePath.includes('schemas\\v2')) return;

  const content = read(filePath);
  try {
    const json = JSON.parse(content);

    // 1. Set $comment (Single line)
    json.$comment = JSON_COMMENT;

    // 2. Set x-mplp-meta
    json['x-mplp-meta'] = { ...JSON_META_BASE };

    write(filePath, JSON.stringify(json, null, 2) + "\n");
  } catch (e) {
    console.error('JSON Error:', filePath, e);
  }
}

function processYaml(filePath) {
  // Only for schemas/invariants
  if (!filePath.includes('schemas/invariants') && !filePath.includes('schemas\\invariants')) return;

  let content = read(filePath);

  // Strip old headers
  content = content.replace(/^# MPLP Protocol v1.0.0[\s\S]*?version\.\n/m, '');
  content = content.replace(/^# MPLP v1.0.0 FROZEN[\s\S]*?\(MPGC\)\n/m, '');

  // Add new header
  content = YAML_HEADER + "\n\n" + content.trimStart();
  write(filePath, content);
}

function processSource(filePath) {
  // Only for packages/*/src
  // Regex to match packages/<any>/src
  if (!/packages[\\\/].*[\\\/]src[\\\/]/.test(filePath)) return;

  // Skip cli.ts special handling if needed, but we handle shebang below

  let content = read(filePath);

  // Preserve Shebang
  const shebangMatch = content.match(/^#!.*\n/);
  const shebang = shebangMatch ? shebangMatch[0] : '';
  if (shebang) content = content.replace(shebang, '');

  // Strip old headers (Block comment style)
  content = content.replace(/^\/\*\*[\s\S]*?MPLP Protocol v1.0.0[\s\S]*?\*\/\s*/, '');
  content = content.replace(/^\/\*\*[\s\S]*?© 2025 邦士[\s\S]*?\*\/\s*/, '');

  // Add new header
  content = SOURCE_HEADER + "\n" + content.trimStart();

  // Restore Shebang
  if (shebang) content = shebang + content;

  write(filePath, content);
}

function processPackageJson(filePath) {
  // Only for packages/*/package.json
  if (!/packages[\\\/].*[\\\/]package\.json/.test(filePath)) return;

  try {
    const json = JSON.parse(read(filePath));

    // Remove Frozen Head ($comment) if present
    if (json.$comment) delete json.$comment;

    // Standard Fields
    json.author = "邦士（北京）网络科技有限公司";
    json.copyright = "© 2025 邦士（北京）网络科技有限公司";
    if (!json.license) json.license = "Apache-2.0";

    // Custom MPLP Meta
    json.mplp = {
      protocolVersion: "1.0.0",
      frozen: true,
      governance: "MPGC"
    };

    // Infer Layer
    if (json.name.includes('core')) json.mplp.layer = 'L1';
    else if (json.name.includes('modules') || json.name.includes('coordination')) json.mplp.layer = 'L2';
    else if (json.name.includes('runtime')) json.mplp.layer = 'L3';
    else if (json.name.includes('integration')) json.mplp.layer = 'L4';
    else if (json.name.includes('devtools') || json.name.includes('sdk')) json.mplp.layer = 'Tools';

    write(filePath, JSON.stringify(json, null, 2) + "\n");
  } catch (e) {
    console.error('Pkg JSON Error:', filePath, e);
  }
}

// ------------------------------------------------------------
// Walker
// ------------------------------------------------------------

function walk(dir) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(full);
    } else {
      // Skip this script
      if (full.endsWith('update-frozen-headers.mjs')) continue;

      if (full.endsWith('.md')) processMarkdown(full);
      else if (full.endsWith('.schema.json')) processJsonSchema(full);
      else if (full.endsWith('.yaml') || full.endsWith('.yml')) processYaml(full);
      else if (full.endsWith('.ts') || full.endsWith('.js')) processSource(full);
      else if (item.name === 'package.json') processPackageJson(full);
    }
  }
}

console.log("Starting MPLP v1.0.x Governance Header Update...");
walk(process.cwd());
console.log("Governance Header Update Complete.");
