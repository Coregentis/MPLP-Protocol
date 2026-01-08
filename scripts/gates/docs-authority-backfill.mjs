#!/usr/bin/env node

/**
 * Docs Authority Backfill
 * Adds authority based on directory taxonomy
 * 
 * Authority Taxonomy v1:
 * - protocol: Normative specification pages
 * - documentation-governance: Informative/reference/guide pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

// Authority Taxonomy v1 - Directory to Authority Mapping
const AUTHORITY_MAP = {
    // Normative (protocol)
    'specification/modules': 'protocol',
    'specification/profiles': 'protocol',
    'specification/observability': 'protocol',
    'specification/architecture/cross-cutting-kernel-duties': 'protocol',

    // Informative specification pages (documentation-governance)
    'specification/architecture': 'Documentation Governance',  // index, deep-dive
    'specification/integration': 'Documentation Governance',
    'specification': 'Documentation Governance',  // matrices, overviews

    // Evaluation (all documentation-governance)
    'evaluation/conformance': 'Documentation Governance',
    'evaluation/golden-flows': 'Documentation Governance',
    'evaluation/governance': 'Documentation Governance',
    'evaluation/standards': 'Documentation Governance',
    'evaluation/tests': 'Documentation Governance',
    'evaluation': 'Documentation Governance',

    // Other areas
    'governance': 'Documentation Governance',
    'guides': 'Documentation Governance',
    'reference': 'Documentation Governance',
    'introduction': 'Documentation Governance',
    'meta': 'Documentation Governance',
    'root': 'Documentation Governance'
};

// Overrides for specific pages that don't match directory pattern
const OVERRIDES = {
    // Spec pages that are actually normative (not just index/overview)
    'specification/architecture/l1-core-protocol.md': 'protocol',
    'specification/architecture/l2-coordination-governance.md': 'protocol',
    'specification/architecture/l3-execution-orchestration.md': 'protocol',
    'specification/architecture/l4-integration-infra.md': 'protocol',

    // "-explained" pages are informative, not normative
    // Already handled by default mapping
};

function getAuthority(relativePath) {
    // Check overrides first
    if (OVERRIDES[relativePath]) {
        return OVERRIDES[relativePath];
    }

    // Try longest prefix match
    const prefixes = Object.keys(AUTHORITY_MAP).sort((a, b) => b.length - a.length);
    const dir = path.dirname(relativePath);

    for (const prefix of prefixes) {
        if (dir.startsWith(prefix) || dir === prefix) {
            return AUTHORITY_MAP[prefix];
        }
    }

    return 'Documentation Governance';  // Default
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { fm: {}, body: content, hasYaml: false };

    const yaml = match[1];
    const body = content.slice(match[0].length);
    const fm = {};

    yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            fm[key] = value;
        }
    });

    return { fm, body, hasYaml: true, rawYaml: yaml };
}

let fixed = 0;
let skipped = 0;

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DOCS_DIR, filePath);
    const { fm, hasYaml, rawYaml, body } = parseFrontmatter(content);

    // Skip if already has valid authority
    if (fm.authority && fm.authority !== 'none') {
        skipped++;
        return;
    }

    const authority = getAuthority(relativePath);

    // Add authority to frontmatter
    const newYaml = `${rawYaml}\nauthority: ${authority}`;
    const newContent = `---\n${newYaml}\n---${body}`;

    fs.writeFileSync(filePath, newContent);
    console.log(`✓ ${relativePath} → ${authority}`);
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

console.log('=== Docs Authority Backfill ===\n');
console.log('Taxonomy: protocol = normative, Documentation Governance = informative\n');

scanDirectory(DOCS_DIR);

console.log(`\nFixed: ${fixed}`);
console.log(`Skipped (already has authority): ${skipped}`);
