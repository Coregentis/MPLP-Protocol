/**
 * B-2 Relative Link Fix Script
 * 
 * Fixes relative paths like ../02-modules/* to new structure
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DOCS_DIR = './docs';

// Relative path replacement rules
const RELATIVE_RULES = [
    // From specification/* looking back
    { from: '../02-modules/', to: '../modules/' },
    { from: '../03-profiles/', to: '../profiles/' },
    { from: '../04-observability/', to: '../observability/' },
    { from: '../07-integration/', to: '../integration/' },
    { from: '../../02-modules/', to: '../../modules/' },
    { from: '../../03-profiles/', to: '../../profiles/' },
    { from: '../../04-observability/', to: '../../observability/' },
    { from: '../../06-golden-flows/', to: '../../../evaluation/golden-flows/' },
    { from: '../../05-learning/', to: '../../../guides/examples/learning-notes/' },

    // Cross-tier references (need absolute paths)
    { from: '../06-golden-flows/', to: '/docs/evaluation/golden-flows/' },
    { from: '../08-guides/', to: '/docs/guides/' },
    { from: '../09-tests/', to: '/docs/evaluation/tests/' },
    { from: '../10-sdk/', to: '/docs/guides/sdk/' },
    { from: '../12-governance/', to: '/docs/evaluation/governance/' },
    { from: '../14-runtime/', to: '/docs/guides/runtime/' },
    { from: '../15-standards/', to: '/docs/evaluation/standards/' },
    { from: '../05-learning/', to: '/docs/guides/examples/learning-notes/' },

    // Double-dot cross-tier
    { from: '../../06-golden-flows/', to: '/docs/evaluation/golden-flows/' },
    { from: '../../08-guides/', to: '/docs/guides/' },
    { from: '../../14-runtime/', to: '/docs/guides/runtime/' },
    { from: '../../05-learning/', to: '/docs/guides/examples/learning-notes/' },
];

let totalReplacements = 0;
let filesModified = 0;

async function processFile(filePath) {
    const content = await readFile(filePath, 'utf8');
    let newContent = content;
    let fileReplacements = 0;

    for (const rule of RELATIVE_RULES) {
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
            entry.name === 'build' || entry.name.startsWith('.') || entry.name === 'redirects') {
            continue;
        }

        if (entry.isDirectory()) {
            await walk(fullPath);
        } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (['.md', '.mdx'].includes(ext)) {
                await processFile(fullPath);
            }
        }
    }
}

console.log('🔗 B-2 Relative Link Fix Script');
console.log('================================\n');

await walk(DOCS_DIR);

console.log('\n📊 Summary:');
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
