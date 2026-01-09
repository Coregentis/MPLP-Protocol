/**
 * B-2 Link Fix Script
 * 
 * Replaces old numeric-prefix paths with new 4-tier IA paths
 * Based on REDIRECTS.json rules
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DOCS_DIR = './docs';

// Replacement rules (old prefix -> new prefix)
const REPLACE_RULES = [
    // SPECIFICATION
    { from: '/docs/01-architecture/', to: '/docs/specification/architecture/' },
    { from: '/docs/02-modules/', to: '/docs/specification/modules/' },
    { from: '/docs/03-profiles/', to: '/docs/specification/profiles/' },
    { from: '/docs/04-observability/', to: '/docs/specification/observability/' },
    { from: '/docs/07-integration/', to: '/docs/specification/integration/' },
    // EVALUATION
    { from: '/docs/06-golden-flows/', to: '/docs/evaluation/golden-flows/' },
    { from: '/docs/09-tests/', to: '/docs/evaluation/tests/' },
    { from: '/docs/12-governance/', to: '/docs/evaluation/governance/' },
    { from: '/docs/15-standards/', to: '/docs/evaluation/standards/' },
    { from: '/docs/16-conformance/', to: '/docs/evaluation/conformance/' },
    // GUIDES
    { from: '/docs/05-learning/', to: '/docs/guides/examples/learning-notes/' },
    { from: '/docs/07a-examples/', to: '/docs/guides/examples/' },
    { from: '/docs/08-guides/', to: '/docs/guides/' },
    { from: '/docs/10-sdk/', to: '/docs/guides/sdk/' },
    { from: '/docs/11-examples/', to: '/docs/guides/examples/' },
    { from: '/docs/14-runtime/', to: '/docs/guides/runtime/' },
    { from: '/docs/17-enterprise/', to: '/docs/guides/enterprise/' },
    { from: '/docs/18-adoption/', to: '/docs/guides/adoption/' },
    // META
    { from: '/docs/00-index/', to: '/docs/meta/index/' },
    { from: '/docs/13-release/', to: '/docs/meta/release/' },
    { from: '/docs/99-meta/', to: '/docs/meta/' },
];

// Also handle bare links without trailing slash
const BARE_RULES = REPLACE_RULES.map(r => ({
    from: r.from.slice(0, -1),  // Remove trailing slash
    to: r.to.slice(0, -1),
}));

const ALL_RULES = [...REPLACE_RULES, ...BARE_RULES];

let totalReplacements = 0;
let filesModified = 0;

async function processFile(filePath) {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;

    for (const rule of ALL_RULES) {
        const regex = new RegExp(escapeRegex(rule.from), 'g');
        const matches = newContent.match(regex);
        if (matches) {
            fileReplacements += matches.length;
            newContent = newContent.replace(regex, rule.to);
        }
    }

    if (fileReplacements > 0) {
        await writeFile(filePath, newContent, 'utf8');
        console.log(`  ✓ ${filePath}: ${fileReplacements} replacements`);
        totalReplacements += fileReplacements;
        filesModified++;
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.name === 'node_modules' || entry.name === '.docusaurus' ||
            entry.name === 'build' || entry.name.startsWith('.')) {
            continue;
        }

        if (entry.isDirectory()) {
            await walk(fullPath);
        } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (['.md', '.mdx', '.tsx', '.ts', '.json'].includes(ext)) {
                await processFile(fullPath);
            }
        }
    }
}

console.log('🔗 B-2 Link Fix Script');
console.log('======================\n');

await walk(DOCS_DIR);

console.log('\n📊 Summary:');
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
