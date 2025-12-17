/**
 * MPLP Docs v1.0 - Freeze Record Generator (Phase 5.4)
 * Generates the official DOCS_SEO_FREEZE_RECORD_v1.0.md
 */

import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';

const DOCS_DIR = path.resolve(__dirname, '../docs');
const REGISTRY_PATH = path.resolve(__dirname, '../docs/00-index/mplp-v1.0-normative-registry.yaml');
const OUTPUT_FILE = path.resolve(__dirname, '../../DOCS_SEO_FREEZE_RECORD_v1.0.md');

// Helper to parse frontmatter safely
function parseFrontMatter(content: string): any {
    const match = content.match(/^[\uFEFF]?---\s*(\r\n|\n)([\s\S]*?)(\r\n|\n)---\s*(\r\n|\n|$)/);
    if (!match) return {};
    try {
        return parseYaml(match[2]);
    } catch { return {}; }
}

// Registry Loader
function loadRegistry(): any[] {
    if (!fs.existsSync(REGISTRY_PATH)) return [];
    const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const data = parseYaml(content) as any;
    return data.documents || [];
}

const registryDocs = loadRegistry();

// Stable logic from DocItem/Layout/index.tsx
function getStableDocKey(fm: any, permalink: string): string {
    if (fm.unversionedId) return fm.unversionedId;
    if (fm.id) return fm.id;
    // permalink stripped of /
    return (permalink || '').replace(/^\//, '');
}

// Section A Data
interface PageRecord {
    path: string;
    permalink: string;
    type: 'Normative' | 'Informative';
    status: string;
    canonical: string;
    normativeId: string;
    jsonLdId: string;
}

// Section B Data
interface CategoryRecord {
    dir: string;
    permalink: string; // generated index permalink guess
    hasCategoryJson: boolean;
    isGeneratedIndex: boolean;
    status: string;
    role: string;
    classificationSource: string;
}

const pages: PageRecord[] = [];
const categories: CategoryRecord[] = [];

function walk(dir: string) {
    const files = fs.readdirSync(dir);

    // Check for _category_.json
    if (files.includes('_category_.json')) {
        try {
            const catContent = fs.readFileSync(path.join(dir, '_category_.json'), 'utf-8');
            const cat = JSON.parse(catContent);
            const isGI = cat.link?.type === 'generated-index';
            if (isGI) {
                const cp = cat.customProps || {};
                // Heuristic permalink for GI: assume folder name usually maps to route, but Docusaurus logic is complex.
                // We'll just use the directory relative path as proxy for now or from 'slug' if in category logic (rare).
                // Usually it's just /<dir-path>
                const relDir = path.relative(DOCS_DIR, dir);
                const permalink = '/' + relDir;

                categories.push({
                    dir: relDir,
                    permalink,
                    hasCategoryJson: true,
                    isGeneratedIndex: true,
                    status: cp.doc_status || 'MISSING',
                    role: cp.doc_role || 'MISSING',
                    classificationSource: '_category_.json'
                });
            }
        } catch (e) {
            console.error(`Failed to parse _category_.json in ${dir}`);
        }
    }

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const fm = parseFrontMatter(content);
            const relPath = path.relative(DOCS_DIR, fullPath);

            // Determine URL & Permalink
            // Simple approach: prefer frontmatter permalink, else derive
            let permalink = fm.permalink;
            if (!permalink) {
                permalink = '/' + relPath.replace(/\.(md|mdx)$/, '');
            }
            const canonical = `https://docs.mplp.io${permalink}`;

            // Logic: Normative vs Informative ID
            let normativeId = 'N/A';
            let jsonLdId = 'UNKNOWN'; // Must be URL

            if (fm.doc_status === 'normative') {
                normativeId = fm.normative_id || 'MISSING';
                const regEntry = registryDocs.find((d: any) => d.id === normativeId);
                if (regEntry && regEntry.json_ld_id) {
                    jsonLdId = regEntry.json_ld_id;
                } else {
                    jsonLdId = 'REGISTRY_MISSING';
                }
            } else {
                // Informative
                normativeId = 'N/A';
                const stableKey = getStableDocKey(fm, permalink);
                jsonLdId = `https://docs.mplp.io/id/doc/${stableKey}`;
            }

            pages.push({
                path: relPath,
                permalink,
                canonical,
                type: fm.doc_status === 'normative' ? 'Normative' : 'Informative',
                status: fm.doc_status || 'MISSING',
                normativeId,
                jsonLdId
            });
        }
    });
}

// Execute
console.log('Generating Freeze Record...');
if (fs.existsSync(DOCS_DIR)) walk(DOCS_DIR);

const mdContent = `
# MPLP Docs SEO Freeze Record v1.0
**Version**: 1.0.0
**Date**: ${new Date().toISOString()}
**Scope**: Protocol Documentation (Frozen)

## Section A: URL → @id Mapping Table
| Source File | Permalink | Status | Canonical URL | Normative ID | JSON-LD @id |
|---|---|---|---|---|---|
${pages.sort((a, b) => a.path.localeCompare(b.path)).map(r => `| \`${r.path}\` | \`${r.permalink}\` | ${r.status} | \`${r.canonical}\` | \`${r.normativeId}\` | \`${r.jsonLdId}\` |`).join('\n')}

**Total Pages**: ${pages.length}

## Section B: Generated-Index Coverage
| Directory | Permalink | Generated Index? | Classification Source | Status | Role |
|---|---|---|---|---|---|
${categories.sort((a, b) => a.dir.localeCompare(b.dir)).map(r => `| \`${r.dir}\` | \`${r.permalink}\` | ${r.isGeneratedIndex ? 'YES' : 'NO'} | \`${r.classificationSource}\` | ${r.status} | ${r.role} |`).join('\n')}

**Total Generated Indices**: ${categories.length}

## Section C: i18n Policy
- **Canonical Locale**: \`en\` (English)
- **Non-en behavior**: \`noindex, follow\`
- **Source**: \`src/theme/Root.tsx\` enforces strict locale checking.
- **Reference**: [Editorial Policy](/13-release/editorial-policy)

---
*Generated by docs/scripts/generate-docs-freeze-record.ts*
`;

fs.writeFileSync(OUTPUT_FILE, mdContent.trim());
console.log(`Freeze Record written to: ${OUTPUT_FILE}`);
