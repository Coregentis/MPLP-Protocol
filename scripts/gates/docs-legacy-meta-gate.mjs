#!/usr/bin/env node

/**
 * Gate v2: Docs Legacy Meta Block Gate
 * Detects legacy meta information blocks that conflict with DocIdentityHeader
 * 
 * Forbidden patterns:
 * - Type A: :::warning[Non-Normative] admonition blocks
 * - Type B: > Authority: / > **Normativity:** blockquote metadata
 * - Type C: **Authority**: / **Status**: FROZEN metadata blocks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

// Mode: 'warn' = WARN only, 'fail' = FAIL on match
const MODE = 'fail';

const FORBIDDEN_PATTERNS = [
    // Type A: Admonition blocks
    { pattern: /:::warning\[Non-Normative\]/g, type: 'A', desc: 'Non-Normative admonition block' },
    { pattern: /:::warning\[Non-Normative Document\]/g, type: 'A', desc: 'Non-Normative Document admonition block' },

    // Type B: Blockquote metadata
    { pattern: /^>\s*\*\*Normativity:\*\*/gm, type: 'B', desc: 'Blockquote Normativity metadata' },
    { pattern: /^>\s*\*\*Authority:\*\*/gm, type: 'B', desc: 'Blockquote Authority metadata' },
    { pattern: /^>\s*Authority:/gm, type: 'B', desc: 'Blockquote Authority: metadata' },

    // Type C: Bold metadata blocks (in non-Type-D contexts)
    { pattern: /^\*\*Document Type\*\*:.*Authority/gm, type: 'C', desc: 'Inline Document Type + Authority metadata' },

    // Type E: Obsidian/GitHub callouts with Non-Normative meta
    { pattern: />\s*\*\*Non-Normative Document\*\*/gm, type: 'E', desc: '**Non-Normative Document** in blockquote' },
    { pattern: />\s*\*\*Non-Normative Guard\*\*/gm, type: 'E', desc: '**Non-Normative Guard** in blockquote' },

    // Type F: Field-style meta lines
    { pattern: /^\*\*Document Status\*\*:/gm, type: 'F', desc: '**Document Status**: line' },
    { pattern: /^>\s*\*\*Status\*\*:\s*Informative/gm, type: 'F', desc: '> **Status**: Informative line' },

    // Type G: Residual blockquote meta
    { pattern: /^>\s*\*\*Version\*\*:/gm, type: 'G', desc: '> **Version**: line' },
    { pattern: /^>\s*\*\*Scope\*\*:/gm, type: 'G', desc: '> **Scope**: line' },
    { pattern: /^>\s*\*\*Non-Goals\*\*:/gm, type: 'G', desc: '> **Non-Goals**: line' },

    // Type H: FROZEN SPECIFICATION blocks and normative claims
    { pattern: /:::info\[Frozen Specification\]/g, type: 'H', desc: ':::info[Frozen Specification] block' },
    { pattern: /This document is normative and frozen/g, type: 'H', desc: 'Normative and frozen claim' },
    { pattern: /\*\*Protocol Version\*\*:.*\*\*Freeze Date\*\*:/g, type: 'H', desc: 'Protocol Version + Freeze Date inline' },
];

// Patterns to allow (Type D - explanation content, not metadata)
const ALLOWED_CONTEXTS = [
    /For FROZEN versions/,  // FAQ explanation
    /MPLP is FROZEN/,       // Explanation text
    /protocol.*FROZEN/i,    // Explanation context
];

let violations = [];
let filesScanned = 0;

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DOCS_DIR, filePath);

    FORBIDDEN_PATTERNS.forEach(({ pattern, type, desc }) => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                violations.push({
                    file: relativePath,
                    type,
                    desc,
                    match: match.substring(0, 60) + (match.length > 60 ? '...' : ''),
                });
            });
        }
    });

    filesScanned++;
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.name.endsWith('.md')) {
            scanFile(fullPath);
        }
    }
}

console.log('=== Gate v2: Docs Legacy Meta Block Detection ===\n');

scanDirectory(DOCS_DIR);

console.log(`Scanned: ${filesScanned} markdown files`);
console.log(`Violations: ${violations.length}`);

if (violations.length > 0) {
    console.log('\n❌ VIOLATIONS FOUND:\n');

    // Group by type
    const byType = { A: [], B: [], C: [], E: [], F: [], G: [], H: [] };
    violations.forEach(v => {
        if (byType[v.type]) byType[v.type].push(v);
    });

    Object.entries(byType).forEach(([type, items]) => {
        if (items.length > 0) {
            console.log(`Type ${type} (${items.length} violations):`);
            items.slice(0, 10).forEach(v => {
                console.log(`  - ${v.file}: ${v.desc}`);
            });
            if (items.length > 10) {
                console.log(`  ... and ${items.length - 10} more`);
            }
            console.log('');
        }
    });

    if (MODE === 'fail') {
        console.log('❌ Gate v2 FAILED');
        process.exit(1);
    } else {
        console.log('⚠️ Gate v2 WARN (violations found but mode=warn)');
        process.exit(0);
    }
} else {
    console.log('\n✅ Gate v2 PASSED (no legacy meta blocks detected)');
    process.exit(0);
}
