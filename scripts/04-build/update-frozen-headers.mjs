import fs from "fs";
import path from "path";

const CHECK_MODE = process.argv.includes("--check");
const WOULD_CHANGE = [];

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

© 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.`;

const SOURCE_HEADER = `/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */`;

const YAML_HEADER = `# MPLP v1.0.0 FROZEN – Invariant Set
# © 2025 Bangshi Beijing Network Technology Limited Company – Apache-2.0
# Governance: MPLP Protocol Governance Committee (MPGC)`;

const JSON_COMMENT = "MPLP v1.0.0 FROZEN – © 2025 Bangshi Beijing Network Technology Limited Company – Apache-2.0 – Governance: MPGC";

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
function write(f, c) {
  const current = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  if (current === c) return;

  if (CHECK_MODE) {
    WOULD_CHANGE.push(f);
    return;
  }

  fs.writeFileSync(f, c, 'utf8');
  console.log('Updated:', f);
}

// ------------------------------------------------------------
// Processors
// ------------------------------------------------------------

function processMarkdown(filePath) {
  let content = read(filePath);

  // Determine file type
  // Normative: docs/00 to docs/07
  const isNormative = /docs[\\/]0[0-7]-/.test(filePath);

  // Governance & Root: README, CHANGELOG, Governance docs, or anything in 12-governance
  const isGovernance = /CODE_OF_CONDUCT|CONTRIBUTING|SECURITY|GOVERNANCE|MAINTAINERS|12-governance/.test(filePath);
  const isRoot = /README\.md|CHANGELOG\.md|LICENSE\.txt/.test(filePath);

  // Other Docs: docs/08+, docs/99
  const isOtherDocs = /docs[\\/](0[8-9]|1[0-9]|99)-/.test(filePath);

  // 1. Remove OLD Frozen Headers (YAML style)
  content = content.replace(/^---[\r\n]+MPLP Protocol: v1.0.0[\s\S]*?---[\r\n]+/, '');

  // 2a. Remove Manual Markdown Headers (bold text style)
  content = content.replace(/^---[\r\n]+\*\*MPLP Protocol 1\.0\.0 — Frozen Specification\*\*[\s\S]*?requires a new protocol version\.\*\*[\r\n]+/, '');
  content = content.replace(/^\*\*MPLP Protocol 1\.0\.0 — Frozen Specification\*\*[\s\S]*?requires a new protocol version\.\*\*[\r\n]+/, '');

  // 2b. Remove ALL NEW Frozen Headers (Blockquote style) - IMPROVED: uses loop to remove ALL duplicates
  const frozenHeaderRegex = /> \[!FROZEN\][\s\S]*?> \*\*Note\*\*:.*?new protocol version\.[\r\n]*/g;
  let prevContent;
  do {
    prevContent = content;
    content = content.replace(frozenHeaderRegex, '');
  } while (content !== prevContent);

  // 3. Remove ALL Existing Footers - IMPROVED: uses loop to remove ALL duplicates
  const footerRegex = /([\r\n]+---)?[\r\n]+(©|&copy;|Copyright)?\s*2025 (邦士（北京）网络科技有限公司|Bangshi Beijing Network Technology Limited Company)[\s\S]*?Version 2\.0\.[\r\n]*/g;
  do {
    prevContent = content;
    content = content.replace(footerRegex, '');
  } while (content !== prevContent);

  // Clean up excessive leading/trailing newlines
  content = content.replace(/^[\r\n]+/, '');
  content = content.trimEnd();

  // 4. Apply Frozen Header (ONLY for Normative)
  // 4. Apply Frozen Header (ONLY for Normative)
  if (isNormative) {
    // Regex to match frontmatter, allowing for optional BOM (\uFEFF) and leading whitespace
    const frontmatterRegex = /^[\uFEFF\s]*---[\r\n]+[\s\S]*?---[\r\n]+/;
    const match = content.match(frontmatterRegex);

    if (match) {
      // Insert AFTER frontmatter
      const frontmatter = match[0];
      const body = content.substring(frontmatter.length);
      content = frontmatter.trimEnd() + "\n\n" + FROZEN_MD_BLOCK + "\n\n" + body.trimStart();
    } else {
      // No frontmatter, prepend (handling potential BOM)
      content = content.replace(/^[\uFEFF\s]*/, ''); // Remove BOM/space if prepending
      content = FROZEN_MD_BLOCK + "\n\n" + content;
    }
  }

  // 6. Inject wrapperClassName for Governance pages
  if (isGovernance) {
    const frontmatterRegex = /^[\uFEFF\s]*---[\r\n]+[\s\S]*?---[\r\n]+/;
    const match = content.match(frontmatterRegex);
    if (match) {
      let frontmatter = match[0];
      if (!frontmatter.includes('wrapperClassName:')) {
        // Inject wrapperClassName
        frontmatter = frontmatter.replace(/---\s*$/, 'wrapperClassName: governance-page\n---\n');
        content = content.replace(frontmatterRegex, frontmatter);
      }
    } else {
      // No frontmatter, create it
      content = "---\nwrapperClassName: governance-page\n---\n\n" + content;
    }
  }

  // 5. Apply Footer (DISABLED per user request - footer exists in site layout)
  // if (isNormative || isGovernance || isRoot || isOtherDocs) {
  //   content = content + COPYRIGHT_FOOTER + "\n";
  // }

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
  content = content.replace(/^# MPLP Protocol v1.0.0[\s\S]*?version\.[\r\n]*/m, '');
  content = content.replace(/^# MPLP v1.0.0 FROZEN[\s\S]*?\(MPGC\)[\r\n]*/m, '');

  // Add new header
  content = YAML_HEADER + "\n\n" + content.trimStart();
  write(filePath, content);
}

function processSource(filePath) {
  // Only for packages/*/src
  if (!/packages[\\/].*[\\/]src[\\/]/.test(filePath)) return;

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
  if (!/packages[\\/].*[\\/]package\.json/.test(filePath)) return;

  try {
    const json = JSON.parse(read(filePath));

    // Remove Frozen Head ($comment) if present
    if (json.$comment) delete json.$comment;

    // Standard Fields
    json.author = "Bangshi Beijing Network Technology Limited Company";
    json.copyright = "© 2025 Bangshi Beijing Network Technology Limited Company";
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

console.log(`Starting MPLP v1.0.x Governance Header ${CHECK_MODE ? "Check" : "Update"}...`);
walk(process.cwd());

if (CHECK_MODE) {
  if (WOULD_CHANGE.length > 0) {
    console.warn("Header drift detected. Files that would change:");
    for (const file of WOULD_CHANGE) {
      console.warn(` - ${file}`);
    }
  }

  console.log("Governance Header Check Complete. No changes required.");
  process.exit(0);
}

console.log("Governance Header Update Complete.");
