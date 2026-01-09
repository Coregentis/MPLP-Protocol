#!/usr/bin/env node

/**
 * Docs Normativity Backfill
 * Adds normativity field to all files that have doc_type but no normativity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

// doc_type to normativity mapping
const DOC_TYPE_MAP = {
    'normative': 'normative',
    'specification': 'normative',
    'informative': 'informative',
    'reference': 'informative',
    'governance': 'informative',
    'guide': 'informative',
    'evaluation': 'informative'
};

let fixed = 0;
let skipped = 0;

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

    const yaml = match[1];
    const body = content.slice(match[0].length);

    // Check if already has normativity
    if (/^normativity:/m.test(yaml)) {
        skipped++;
        return;
    }

    // Get doc_type
    const docTypeMatch = yaml.match(/^doc_type:\s*(.+)$/m);
    if (!docTypeMatch) return;

    const docType = docTypeMatch[1].trim();
    const normativity = DOC_TYPE_MAP[docType] || 'informative';

    // Add normativity after doc_type line
    const newYaml = yaml.replace(
        /^(doc_type:\s*.+)$/m,
        `$1\nnormativity: ${normativity}`
    );

    const newContent = `---\n${newYaml}\n---${body}`;
    fs.writeFileSync(filePath, newContent);

    console.log(`✓ ${path.relative(DOCS_DIR, filePath)} → ${normativity}`);
    fixed++;
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            processFile(fullPath);
        }
    }
}

console.log('=== Docs Normativity Backfill ===\n');
scanDirectory(DOCS_DIR);
console.log(`\nFixed: ${fixed}`);
console.log(`Skipped (already has normativity): ${skipped}`);
