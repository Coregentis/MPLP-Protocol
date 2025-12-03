import fs from "fs";
import path from "path";

// ------------------------------------------------------------
// 1. Frozen Header Templates for Different File Types
// ------------------------------------------------------------

const TS_HEADER = `/**
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
`;

const MD_HEADER = `---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---
`;

const YAML_HEADER = `# MPLP Protocol v1.0.0 — Frozen Specification
# Freeze Date: 2025-12-03
# Status: FROZEN (no breaking changes permitted)
# Governance: MPLP Protocol Governance Committee (MPGC)
# © 2025 邦士（北京）网络科技有限公司
# License: Apache-2.0
# Any normative change requires a new protocol version.
`;

// CORRECTED: Single string with \n for JSON Schema Draft-07 compliance
const JSON_HEADER_STRING = "MPLP Protocol v1.0.0 — Frozen Specification\nFreeze Date: 2025-12-03\nStatus: FROZEN (no breaking changes permitted)\nGovernance: MPLP Protocol Governance Committee (MPGC)\nCopyright: © 2025 邦士（北京）网络科技有限公司\nLicense: Apache-2.0\nAny normative change requires a new protocol version.";

// ------------------------------------------------------------
// 2. Utility
// ------------------------------------------------------------

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
  console.log("Updated:", file);
}

// ------------------------------------------------------------
// 3. Remove Old Headers
// ------------------------------------------------------------

function stripOldTSHeader(content) {
  // Match header even if preceded by whitespace/newlines
  return content.replace(/^[\s\n]*\/\*\*[\s\S]*?\*\/\s*/, "").trimStart();
}

function stripOldMDHeader(content) {
  return content.replace(/^---[\s\S]*?---\s*/m, "").trimStart();
}

function stripOldYAMLHeader(content) {
  return content.replace(/^(#.*\n)+/m, "").trimStart();
}

function stripOldJSONHeader(obj) {
  if (obj["$comment"]) {
    delete obj["$comment"];
  }
  return obj;
}

// ------------------------------------------------------------
// 4. Apply New Header by Type
// ------------------------------------------------------------

function applyTSHeader(content) {
  // Handle shebang - find it anywhere in the file (to fix misplaced ones)
  const shebangMatch = content.match(/^#!.*\n/m);
  const shebang = shebangMatch ? shebangMatch[0] : "";

  // Remove shebang from content for processing
  if (shebang) {
    content = content.replace(shebang, "");
    // console.log("Found shebang:", shebang.trim());
  }

  const beforeStrip = content.length;
  content = stripOldTSHeader(content);
  // if (content.length < beforeStrip) console.log("Stripped header");

  // Re-assemble: Shebang + Header + Content
  return shebang + TS_HEADER + "\n" + content;
}

function applyMDHeader(content) {
  content = stripOldMDHeader(content);
  return MD_HEADER + "\n" + content;
}

function applyYAMLHeader(content) {
  content = stripOldYAMLHeader(content);
  return YAML_HEADER + "\n" + content;
}

function applyJSONHeader(content) {
  try {
    const obj = JSON.parse(content);
    const cleaned = stripOldJSONHeader(obj);
    // Add comment as first property if possible (not guaranteed in JSON but usually works)
    const newObj = { "$comment": JSON_HEADER_STRING, ...cleaned };
    return JSON.stringify(newObj, null, 2) + "\n";
  } catch (err) {
    console.error("Invalid JSON, skipping:", err);
    return content;
  }
}

// ------------------------------------------------------------
// 5. File Walker
// ------------------------------------------------------------

const EXT_MAP = {
  ts: applyTSHeader,
  js: applyTSHeader,
  md: applyMDHeader,
  json: applyJSONHeader,
  yaml: applyYAMLHeader,
  yml: applyYAMLHeader
};

function walk(dir) {
  // Skip node_modules and .git and dist
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(full);
      continue;
    }

    const ext = item.name.split(".").pop();
    const fn = EXT_MAP[ext];
    if (!fn) continue;

    // Skip this script itself
    if (full.endsWith('update-frozen-headers.mjs')) continue;
    // Skip cli.ts as it requires special shebang handling and is handled separately
    if (full.endsWith('cli.ts')) continue;

    try {
      let content = read(full);
      let updated = fn(content);
      write(full, updated);
    } catch (e) {
      console.error(`Error processing ${full}:`, e.message);
    }
  }
}

// ------------------------------------------------------------
// 6. Execute
// ------------------------------------------------------------

const ROOT = process.cwd();
console.log("Starting Frozen Header Update (JSON String Fix)...");
walk(ROOT);
console.log("Frozen Header update complete.");
