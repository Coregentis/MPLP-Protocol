
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { glob } from 'glob';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DOCS_DIR = path.resolve(__dirname, '../');
const DOCS_CONTENT_DIR = path.join(DOCS_DIR, 'docs');
const DOCS_REPORTS_DIR = path.join(DOCS_DIR, 'reports');

const PATHS = {
    SCHEMA_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_SCHEMA_INDEX.json'),
    MANUAL_BINDING_MAP: path.join(DOCS_REPORTS_DIR, 'MANUAL_PAGE_BINDING_MAP_v1.0.yaml'),
    PAGE_ALIGNMENT_MAP: path.join(DOCS_REPORTS_DIR, 'PAGE_ALIGNMENT_MAP.json'),
};

console.log('Starting Phase D: Category Semantic Content Reconstruction...');

// Helpers
function safeReadJson(filePath: string) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { console.warn(`Failed to read JSON: ${filePath}`); return null; }
}

function safeReadYaml(filePath: string) {
    try { return yaml.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { return null; }
}

function getChildPages(dirPath: string): string[] {
    // Non-recursive, immediate children matching .md/.mdx
    try {
        const files = fs.readdirSync(dirPath);
        return files.filter(f => (f.endsWith('.md') || f.endsWith('.mdx')) && !f.startsWith('_'));
    } catch { return []; }
}

async function main() {
    // 1. Load Indices
    const schemaIndex = safeReadJson(PATHS.SCHEMA_INDEX) || {};
    const manualMap = safeReadYaml(PATHS.MANUAL_BINDING_MAP) || { bindings: {} };
    // const pageMap = safeReadJson(PATHS.PAGE_ALIGNMENT_MAP) || {}; // Optional, using manual map as primary truth for spec binding

    // Normalize Manual Map
    const normalizedManualMap: any = {};
    if (manualMap.bindings) {
        for (const [k, v] of Object.entries(manualMap.bindings)) {
            // Key is relative to project root: docs/docs/03-profiles/sa-profile.md
            // We want to match efficiently.
            normalizedManualMap[k] = v;
        }
    }

    // 2. Find All Categories
    const categoryFiles = await glob(path.join(DOCS_CONTENT_DIR, '**/_category_.json'));
    console.log(`Found ${categoryFiles.length} categories.`);

    const reportData: any[] = [];
    let failureCount = 0;

    for (const catFile of categoryFiles) {
        const dirPath = path.dirname(catFile);
        const relPath = path.relative(DOCS_CONTENT_DIR, dirPath); // e.g. 06-runtime
        let catContent: any = {};
        try {
            catContent = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
        } catch { console.error(`Invalid JSON: ${catFile}`); continue; }

        // --- Step D2: Aggregate Semantics ---
        const childFiles = getChildPages(dirPath);

        const evidencePool: any = {
            schema_ids: new Set<string>(),
            invariants: new Set<string>(),
            goldens: new Set<string>(),
            codes: new Set<string>()
        };

        let hasDocsChildren = childFiles.length > 0;

        for (const child of childFiles) {
            const childPath = path.join(dirPath, child);
            const projectRelPath = path.relative(PROJECT_ROOT, childPath);

            // Check Manual Map first (T0 Truth)
            const binding = normalizedManualMap[projectRelPath];
            if (binding) {
                if (binding.schema_refs) binding.schema_refs.forEach((s: string) => evidencePool.schema_ids.add(s));
                if (binding.invariant_refs) binding.invariant_refs.forEach((s: string) => evidencePool.invariants.add(s));
                if (binding.golden_refs) binding.golden_refs.forEach((s: string) => evidencePool.goldens.add(s));
                if (binding.code_refs) {
                    if (binding.code_refs.ts) binding.code_refs.ts.forEach((s: string) => evidencePool.codes.add(s));
                    if (binding.code_refs.py) binding.code_refs.py.forEach((s: string) => evidencePool.codes.add(s));
                }
            } else {
                // Try to read frontmatter if not in manual map (for auto-discovered T0 refs in Phase C)
                // Or we rely solely on Manual Map for "Category Guarantee" to keep it high-bar?
                // Runbook: "Collect from child pages". 
                // Let's rely on Manual Map for the *Guaranteed Behavioral Statements*.
                // Because auto-discovered links might be weak.
            }
        }

        // --- Step D3: Construct Semantics Object ---

        // Statements
        // Heuristic: Map Schema IDs to Titles
        const guaranteedBehaviors: any[] = [];

        if (evidencePool.schema_ids.size > 0) {
            const schemaTitles = Array.from(evidencePool.schema_ids).map((id: any) => {
                const s = schemaIndex[id];
                return s ? s.title.replace(' Schema', '').replace('MPLP ', '') : id.split('/').pop().replace('.schema.json', '');
            });
            // Dedup titles
            const uniqueTitles = [...new Set(schemaTitles)];

            guaranteedBehaviors.push({
                statement: `Defines protocols for: ${uniqueTitles.join(', ')}.`,
                evidence: {
                    schema_refs: Array.from(evidencePool.schema_ids)
                }
            });
        }

        if (evidencePool.invariants.size > 0) {
            guaranteedBehaviors.push({
                statement: `Guarantees behavioral invariants defined in ${evidencePool.invariants.size} invariant specifications.`,
                evidence: {
                    invariant_refs: Array.from(evidencePool.invariants)
                }
            });
        }

        if (guaranteedBehaviors.length === 0 && hasDocsChildren && relPath !== '99-meta') {
            // Narrative Category?
            guaranteedBehaviors.push({
                statement: "Provides informative documentation and architectural overviews.",
                evidence: {}
            });
        }

        // Explicit Non-Claims
        const explicitNonClaims = [];
        explicitNonClaims.push("Does not define normative constraints not explicitly bound in 'guaranteed_behaviors'.");
        if (relPath.includes('guides') || relPath.includes('examples')) {
            explicitNonClaims.push("Does not define protocol compliant behavior.");
        }

        const categorySemantics = {
            scope: `Normative coverage for ${relPath.replace(/\d+-/, '').replace('/', ' -> ')}`,
            guaranteed_behaviors: guaranteedBehaviors,
            explicit_non_claims: explicitNonClaims,
            truth_binding: {
                binding_source: "MANUAL_PAGE_BINDING_MAP_v1.0.yaml",
                binding_type: "aggregate"
            }
        };

        // Inject Semantics into customProps (Docusaurus Strict Mode compatibility)
        if (!catContent.customProps) {
            catContent.customProps = {};
        }
        catContent.customProps.category_semantics = categorySemantics;

        // Cleanup legacy top-level key if exists (Fix for Docusaurus build)
        if ('category_semantics' in catContent) {
            delete (catContent as any).category_semantics;
        }

        // Write
        fs.writeFileSync(catFile, JSON.stringify(catContent, null, 2));

        // Step D5: Validation Logic
        let status = 'PASS';
        let note = '';

        // 1. MUST/SHALL Check in Label/Desc (Assuming standard docusaurus fields)
        const textToCheck = (catContent.label || '') + (catContent.customProps?.description || '');
        if (/\b(MUST|SHALL|REQUIRED)\b/i.test(textToCheck)) {
            status = 'FAIL';
            note = 'Blocking: Normative claims in Category Label/Description';
            failureCount++;
        }

        // 2. Empty Semantics Logic
        // If it's a normative dir (based on path) but has no guarantees?
        // Let's be lenient for D - just ensure structure exists.

        reportData.push({
            category: relPath,
            pages: childFiles.length,
            guarantees: guaranteedBehaviors.length,
            status,
            note
        });
    }

    // Generate Report
    let mkReport = '# Category Content Coverage Report v1.0\n\n';
    mkReport += `Total Categories: ${categoryFiles.length}\n`;
    mkReport += `Failures: ${failureCount}\n\n`;
    mkReport += `| Category | Pages | Guarantees | Status | Note |\n`;
    mkReport += `|---|---|---|---|---|\n`;

    reportData.forEach(r => {
        mkReport += `| ${r.category} | ${r.pages} | ${r.guarantees} | ${r.status} | ${r.note} |\n`;
    });

    fs.writeFileSync(path.join(DOCS_REPORTS_DIR, 'CATEGORY_CONTENT_COVERAGE_REPORT_v1.0.md'), mkReport);
    fs.writeFileSync(path.join(DOCS_REPORTS_DIR, 'CATEGORY_BINDING_MAP.json'), JSON.stringify(reportData, null, 2));

    if (failureCount > 0) {
        console.error(`Phase D FAILED with ${failureCount} issues.`);
        process.exit(1);
    } else {
        console.log('Phase D PASSED.');
    }
}

main();
