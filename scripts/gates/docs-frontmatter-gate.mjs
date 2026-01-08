#!/usr/bin/env node

/**
 * Docs Frontmatter Audit Script
 * Scans all docs for missing/incomplete frontmatter fields
 * Reports pages that will show UNKNOWN in DocIdentityHeader
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const result = {};

    yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            result[key] = value;
        }
    });

    return result;
}

// Required fields for proper DocIdentityHeader display

const REQUIRED_FIELDS = ['normativity', 'authority'];
const RECOMMENDED_FIELDS = ['lifecycle_status', 'description', 'protocol_version'];

// Valid normativity values (doc_type is NOT a substitute)
const VALID_NORMATIVITY = ['normative', 'informative', 'non-normative', 'formative'];

// Fallback mappings (for lifecycle_status only, NOT normativity)
const FALLBACK_LIFECYCLE = ['status'];

let results = {
    unknown: [],
    missingRecommended: [],
    complete: [],
    total: 0
};

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DOCS_DIR, filePath);

    try {
        const fm = parseFrontmatter(content);
        results.total++;

        // Check for normativity (MUST be explicit, doc_type is NOT valid)
        const hasNormativity = fm.normativity;
        const validNormativity = hasNormativity && VALID_NORMATIVITY.includes(fm.normativity);

        // Warn if using doc_type without normativity
        if (!hasNormativity && fm.doc_type) {
            console.warn(`  WARN: ${relativePath} has doc_type but no normativity`);
        }

        // Check for authority
        const hasAuthority = fm.authority;

        // Check for lifecycle_status (with fallback)
        const hasLifecycle = fm.lifecycle_status || fm.status;

        // Will this show UNKNOWN?
        const willBeUnknown = !validNormativity;

        if (willBeUnknown) {
            results.unknown.push({
                file: relativePath,
                missing: ['normativity'],
                has: Object.keys(fm).filter(k => !['title', 'sidebar_label', 'sidebar_position', 'keywords'].includes(k))
            });
        } else {
            // Check recommended fields
            const missingRecommended = [];
            if (!hasLifecycle) missingRecommended.push('lifecycle_status');
            if (!fm.description) missingRecommended.push('description');
            if (!hasAuthority || hasAuthority === 'none') missingRecommended.push('authority');

            if (missingRecommended.length > 0) {
                results.missingRecommended.push({
                    file: relativePath,
                    missing: missingRecommended
                });
            } else {
                results.complete.push(relativePath);
            }
        }
    } catch (e) {
        console.error(`Error parsing ${relativePath}: ${e.message}`);
    }
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            auditFile(fullPath);
        }
    }
}

console.log('=== Docs Frontmatter Completeness Audit ===\n');

scanDirectory(DOCS_DIR);

console.log(`Total files: ${results.total}`);
console.log(`Complete: ${results.complete.length}`);
console.log(`Missing recommended: ${results.missingRecommended.length}`);
console.log(`Will show UNKNOWN: ${results.unknown.length}`);

if (results.unknown.length > 0) {
    console.log('\n❌ FILES THAT WILL SHOW UNKNOWN:\n');
    results.unknown.forEach(r => {
        console.log(`  ${r.file}`);
        console.log(`    Missing: ${r.missing.join(', ')}`);
        console.log(`    Has: ${r.has.join(', ') || '(none)'}`);
    });
}

if (results.missingRecommended.length > 0) {
    console.log('\n⚠️ FILES MISSING RECOMMENDED FIELDS (sample):\n');
    results.missingRecommended.slice(0, 10).forEach(r => {
        console.log(`  ${r.file}: missing ${r.missing.join(', ')}`);
    });
    if (results.missingRecommended.length > 10) {
        console.log(`  ... and ${results.missingRecommended.length - 10} more`);
    }
}

// Exit with error if any UNKNOWN
if (results.unknown.length > 0) {
    console.log('\n❌ AUDIT FAILED (UNKNOWN pages detected)');
    process.exit(1);
} else {
    console.log('\n✅ AUDIT PASSED (no UNKNOWN pages)');
    process.exit(0);
}
