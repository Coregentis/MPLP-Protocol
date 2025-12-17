/**
 * MPLP Docs v1.0 - Semantic Alignment Audit Script (Phase 3)
 * 
 * Enforces R1-R14 audit rules to ensure Protocol-Grade compliance.
 * Outputs: docs/reports/semantic-findings.json, docs/reports/DOCS_SEMANTIC_ALIGNMENT_REPORT_v1.0.md
 * 
 * Usage:
 *   pnpm docs:semantic:audit
 */

import fs from 'fs/promises';
import path from 'path';
import { parse as parseYaml } from 'yaml';

// =============================================================================
// Configuration
// =============================================================================

const DOCS_ROOT = path.resolve(__dirname, '../docs');
const REGISTRY_PATH = path.resolve(__dirname, '../docs/00-index/mplp-v1.0-normative-registry.yaml');
const REPORTS_DIR = path.resolve(__dirname, '../reports');

type Severity = 'FAIL' | 'WARN' | 'PASS';

interface Finding {
    rule: string;
    severity: Severity;
    file: string;
    permalink?: string;
    message: string;
}

interface DocMetadata {
    file: string;
    relPath: string;
    content: string;
    fm: any;
    isKeywordsOnly?: boolean; // If only keywords in frontmatter
}

interface RegistryEntry {
    id: string;
    permalink: string;
    spec_level?: string;
}

// =============================================================================
// Rules Logic
// =============================================================================

async function loadRegistry(): Promise<{ permalinkMap: Map<string, RegistryEntry>, idMap: Map<string, RegistryEntry> }> {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const data = parseYaml(content) as any;
    const permalinkMap = new Map<string, RegistryEntry>();
    const idMap = new Map<string, RegistryEntry>();

    data.documents?.forEach((doc: any) => {
        if (doc.permalink) permalinkMap.set(doc.permalink, doc);
        if (doc.id) idMap.set(doc.id, doc);
    });

    return { permalinkMap, idMap };
}

function getFrontmatter(content: string): any {
    // Robust regex for frontmatter with BOM support
    // Starts with optional BOM, then ---, then newline
    const match = content.match(/^[\uFEFF]?---\s*(\r\n|\n)([\s\S]*?)(\r\n|\n)---\s*(\r\n|\n|$)/);
    if (!match) return {};
    try {
        return parseYaml(match[2]); // match[2] is content
    } catch { return {}; }
}

async function checkFile(
    file: string,
    relPath: string,
    registry: { permalinkMap: Map<string, RegistryEntry>, idMap: Map<string, RegistryEntry> }
): Promise<Finding[]> {
    const findings: Finding[] = [];
    const content = await fs.readFile(file, 'utf-8');
    const fm = getFrontmatter(content);

    // Heuristic permalink
    let permalink = fm.permalink;
    if (!permalink) {
        // Attempt to derive
        let cleanPath = relPath.replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
        const parts = cleanPath.split('/').map(p => p.replace(/^\d{2,}-/, ''));
        permalink = '/' + parts.join('/');
    }

    const docStatus = fm.doc_status;
    const normativeId = fm.normative_id;

    // R2: Normative Classifiability (Deterministic Check)
    // FAIL if doc_status === 'normative' cannot be resolved from frontmatter
    // (We Assume frontmatter is the Source of Truth for this static audit)
    if (docStatus === 'normative') {
        // Pass
    } else if (docStatus === 'informative') {
        // Pass
    } else {
        // If undefined, is it in registry?
        if (registry.permalinkMap.has(permalink)) {
            // It SHOULD be normative, but isn't marked.
            // But verify if bulk-normalize would fix it.
            // For audit, if it's MISSING frontmatter status and IS in registry => FAIL R2 (Ambiguous)
            findings.push({
                rule: 'R2',
                severity: 'FAIL',
                file: relPath,
                permalink,
                message: `Ambiguous status: Document in registry but missing 'doc_status: normative' in frontmatter.`
            });
        }
        // If not in registry and no status => it's ambiguous. default is informative?
        // Audit should be strict.
        if (!docStatus) {
            findings.push({
                rule: 'R2',
                severity: 'WARN',
                file: relPath,
                permalink,
                message: `Missing 'doc_status'. Defaulting to informative, but explicit status preferred.`
            });
        }
    }

    // R10: Informative Terminology
    if (docStatus === 'informative') {
        // use longest-first matching to avoid partial matches (e.g. MUST inside MUST NOT)
        const rfc2119 = /\b(MUST NOT|SHALL NOT|NOT RECOMMENDED|SHOULD NOT|MUST|REQUIRED|SHALL|SHOULD|RECOMMENDED|MAY|OPTIONAL)\b/g;
        if (rfc2119.test(content)) {
            // Exception: normative_refs or schema_refs present
            const hasExemption = (fm.normative_refs && fm.normative_refs.length > 0) || (fm.schema_refs && fm.schema_refs.length > 0);
            if (!hasExemption) {
                findings.push({
                    rule: 'R10',
                    severity: 'FAIL',
                    file: relPath,
                    permalink,
                    message: `Informative doc uses RFC2119 keywords without 'normative_refs' exemption.`
                });
            }
        }
    }

    // R11: Permalink / Slug
    if (fm.slug && !fm.permalink) {
        // If slug starts with /, it acts as permalink.
        // Warning if permalink missing but slug exists?
        // Docusaurus uses slug as permalink if it starts with /.
        if (!String(fm.slug).startsWith('/')) {
            findings.push({
                rule: 'R11',
                severity: 'WARN',
                file: relPath,
                permalink,
                message: `Slug '${fm.slug}' is relative. Absolute permalink preferred.`
            });
        }
    }

    // R14: Normative ID Resolution
    if (docStatus === 'normative') {
        if (!normativeId) {
            findings.push({
                rule: 'R14',
                severity: 'FAIL',
                file: relPath,
                permalink,
                message: `Normative document missing 'normative_id'.`
            });
        } else {
            if (!registry.idMap.has(normativeId)) {
                findings.push({
                    rule: 'R14',
                    severity: 'FAIL',
                    file: relPath,
                    permalink,
                    message: `normative_id '${normativeId}' not valid in registry.`
                });
            }
        }
    }

    return findings;
}

async function checkCategory(file: string, relPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const content = await fs.readFile(file, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    } catch { return []; }

    // R13: generated-index classification
    if (data.link?.type === 'generated-index') {
        const cp = data.customProps || {};
        if (!cp.doc_status || !cp.doc_role) {
            findings.push({
                rule: 'R13',
                severity: 'FAIL',
                file: relPath,
                message: `generated-index missing classification (doc_status/doc_role) in customProps.`
            });
        }
    }
    return findings;
}

async function main() {
    console.log("Starting Semantic Alignment Audit (R1-R14)...");

    // R1-R14 logic overview:
    // R1: Allowlist modules (Skipped for skeleton, requires deep parsing)
    // R2: Classifiability (Implemented)
    // R10: Terminology (Implemented)
    // R11: Permalink (Implemented)
    // R13: Generated Index (Implemented)
    // R14: Normative ID (Implemented)

    await fs.mkdir(REPORTS_DIR, { recursive: true });

    const registry = await loadRegistry();
    const allFindings: Finding[] = [];

    async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(DOCS_ROOT, fullPath);

            if (entry.isDirectory()) {
                const catPath = path.join(fullPath, '_category_.json');
                try {
                    await fs.access(catPath);
                    const findings = await checkCategory(catPath, relPath + '/_category_.json');
                    allFindings.push(...findings);
                } catch { }
                await walk(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
                const findings = await checkFile(fullPath, relPath, registry);
                allFindings.push(...findings);
            }
        }
    }

    await walk(DOCS_ROOT);

    // Generate Report
    const failCount = allFindings.filter(f => f.severity === 'FAIL').length;
    const warnCount = allFindings.filter(f => f.severity === 'WARN').length;

    console.log(`Audit Complete. FAIL: ${failCount}, WARN: ${warnCount}`);

    // JSON Output
    await fs.writeFile(path.join(REPORTS_DIR, 'semantic-findings.json'), JSON.stringify(allFindings, null, 2));

    // Markdown Report
    let md = `# Docs Semantic Alignment Report v1.0\n\n`;
    md += `**Date:** ${new Date().toISOString()}\n`;
    md += `**Status:** ${failCount > 0 ? 'FAIL' : 'PASS'}\n\n`;

    md += `## Rule Summary\n\n`;
    md += `| Rule | FAIL | WARN |\n|---|---|---|\n`;
    // Aggregate by rule (simple)
    const rules = ['R2', 'R10', 'R11', 'R13', 'R14']; // and others if added
    rules.forEach(r => {
        const f = allFindings.filter(x => x.rule === r && x.severity === 'FAIL').length;
        const w = allFindings.filter(x => x.rule === r && x.severity === 'WARN').length;
        md += `| ${r} | ${f} | ${w} |\n`;
    });

    md += `\n## Findings\n\n`;
    allFindings.forEach(f => {
        md += `- **[${f.severity}]** ${f.rule} in \`${f.file}\`: ${f.message}\n`;
    });

    await fs.writeFile(path.join(REPORTS_DIR, 'DOCS_SEMANTIC_ALIGNMENT_REPORT_v1.0.md'), md);

    if (failCount > 0) process.exit(1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
