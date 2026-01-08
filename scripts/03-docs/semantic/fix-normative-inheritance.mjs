/**
 * fix-normative-inheritance.mjs
 * 
 * Adds explicit `**Scope**: Inherited` and `**Non-Goals**: Inherited`
 * declarations to normative child pages that lack them.
 * 
 * This converts implicit inheritance to explicit, machine-verifiable inheritance
 * per DGP-08 v2.0 Section Inheritance Policy.
 * 
 * Usage:
 *   node scripts/semantic/fix-normative-inheritance.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DOCS_DIR = path.join(ROOT, 'docs/docs');

const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAllFiles(dir, extensions, excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next']) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                results = results.concat(getAllFiles(fullPath, extensions, excludeDirs));
            }
        } else if (extensions.some(ext => file.endsWith(ext))) {
            results.push(fullPath);
        }
    });
    return results;
}

function parseFrontmatter(raw) {
    if (!raw.startsWith('---')) return { fm: null, body: raw, fmEnd: 0 };
    const end = raw.indexOf('\n---', 3);
    if (end === -1) return { fm: null, body: raw, fmEnd: 0 };
    const fmText = raw.slice(3, end).trim();
    const fmEnd = end + 4; // Position after closing ---
    const body = raw.slice(fmEnd);
    try {
        const fm = yaml.load(fmText) || {};
        return { fm, body, fmEnd };
    } catch {
        return { fm: null, body: raw, fmEnd: 0 };
    }
}

function getParentPath(filePath) {
    // Get the parent directory for inheritance reference
    const relativePath = path.relative(DOCS_DIR, filePath);
    const parts = relativePath.split(path.sep);

    if (parts.length <= 1) return null;

    // For cross-cutting-kernel-duties/coordination.md -> cross-cutting-kernel-duties/
    const parentDir = parts.slice(0, -1).join('/');
    return `/docs/${parentDir}/`;
}

function needsInheritance(content) {
    // Check if page already has Scope/Non-Goals
    const hasScope = content.includes('## Scope') ||
        content.includes('**Scope**: Inherited') ||
        content.includes('**Scope**:');
    const hasNonGoals = content.includes('## Non-Goals') ||
        content.includes('**Non-Goals**: Inherited') ||
        content.includes('**Non-Goals**:');

    return !hasScope || !hasNonGoals;
}

function isNormativePage(content, fm) {
    // Check if page is normative
    if (fm?.doc_type === 'normative') return true;
    if (content.includes('Status**: Normative')) return true;
    if (content.includes('**Status**: Normative')) return true;
    return false;
}

function isChildPage(filePath) {
    // Child pages are not index files and are in subdirectories
    const basename = path.basename(filePath);
    if (basename === 'index.md' || basename === 'index.mdx') return false;

    const relativePath = path.relative(DOCS_DIR, filePath);
    const parts = relativePath.split(path.sep);

    // Must be at least 2 levels deep (e.g., 01-architecture/cross-cutting-kernel-duties/coordination.md)
    return parts.length >= 2;
}

function addInheritanceBlock(content, fmEnd, parentPath) {
    // Insert inheritance block after frontmatter, before first heading
    const body = content.slice(fmEnd);
    const frontmatter = content.slice(0, fmEnd);

    // Find the first heading or significant content
    const firstHeadingMatch = body.match(/^(#+ .+)/m);

    const inheritanceBlock = `
> **Scope**: Inherited (from ${parentPath})
> **Non-Goals**: Inherited (from ${parentPath})

`;

    if (firstHeadingMatch) {
        const headingPos = body.indexOf(firstHeadingMatch[0]);
        return frontmatter + body.slice(0, headingPos) + inheritanceBlock + body.slice(headingPos);
    } else {
        // No heading found, add at beginning
        return frontmatter + inheritanceBlock + body;
    }
}

// ============================================================
// MAIN
// ============================================================

function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  Fix Normative Inheritance (DGP-08 v2.0 Compliance)          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    if (DRY_RUN) {
        console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }

    const docsFiles = getAllFiles(DOCS_DIR, ['.md', '.mdx']);
    console.log(`Found ${docsFiles.length} documentation files\n`);

    let fixed = 0;
    let skipped = 0;
    const fixedFiles = [];

    docsFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const { fm, body, fmEnd } = parseFrontmatter(content);

        // Skip non-normative pages
        if (!isNormativePage(content, fm)) {
            return;
        }

        // Skip root/index pages
        if (!isChildPage(file)) {
            return;
        }

        // Skip pages that already have inheritance or explicit sections
        if (!needsInheritance(content)) {
            skipped++;
            return;
        }

        const parentPath = getParentPath(file);
        if (!parentPath) {
            console.log(`⚠ Could not determine parent for: ${path.relative(ROOT, file)}`);
            return;
        }

        const relativePath = path.relative(ROOT, file);

        if (DRY_RUN) {
            console.log(`📝 Would fix: ${relativePath}`);
            console.log(`   Parent: ${parentPath}`);
        } else {
            const newContent = addInheritanceBlock(content, fmEnd, parentPath);
            fs.writeFileSync(file, newContent);
            console.log(`✅ Fixed: ${relativePath}`);
        }

        fixed++;
        fixedFiles.push(relativePath);
    });

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Files scanned: ${docsFiles.length}`);
    console.log(`   - Files fixed: ${fixed}`);
    console.log(`   - Files already compliant: ${skipped}`);
    console.log('═'.repeat(60));

    if (DRY_RUN && fixed > 0) {
        console.log('\n💡 Run without --dry-run to apply changes');
    }

    return { fixed, skipped, files: fixedFiles };
}

main();
