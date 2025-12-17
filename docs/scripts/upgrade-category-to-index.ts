
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// --- Configuration ---
const DOCS_DIR = path.resolve(__dirname, '../docs');
const REPORTS_DIR = path.resolve(__dirname, '../reports');
const BINDING_MAP_PATH = path.join(REPORTS_DIR, 'CATEGORY_BINDING_MAP.json');
const REPORT_OUTPUT_PATH = path.join(REPORTS_DIR, 'CATEGORY_INDEX_DOC_UPGRADE_REPORT_v1.0.md');
const BINDINGS_OUTPUT_PATH = path.join(REPORTS_DIR, 'CATEGORY_INDEX_DOC_BINDINGS_v1.0.json');

// --- Types ---
interface CategoryJson {
    label: string;
    link: {
        type: 'generated-index' | 'doc';
        id?: string;
        description?: string;
        [key: string]: any;
    };
    customProps?: {
        doc_status?: string;
        doc_role?: string;
        spec_level?: string;
        category_semantics?: {
            scope?: string;
            guaranteed_behaviors?: { statement: string; evidence?: any[] }[];
            explicit_non_claims?: string[];
            [key: string]: any;
        };
        [key: string]: any;
    };
    [key: string]: any;
}

interface BindingMap {
    [categoryDir: string]: {
        schema_refs?: string[];
        invariant_refs?: string[];
        golden_refs?: string[];
        code_refs?: { ts?: string[]; py?: string[] };
    }
}

interface ReportStats {
    totalCategories: number;
    createdIndexPages: number;
    reusedExistingIndex: number;
    weakBindings: number;
    updatedCategories: number;
}

const stats: ReportStats = {
    totalCategories: 0,
    createdIndexPages: 0,
    reusedExistingIndex: 0,
    weakBindings: 0,
    updatedCategories: 0,
};

const upgradeLogs: string[] = [];

// --- Main Execution ---
async function main() {
    console.log('Starting Category Index Doc Upgrade (v1.0 Strict)...');

    // 1. Load Inputs
    let bindingMap: BindingMap = {};
    if (fs.existsSync(BINDING_MAP_PATH)) {
        bindingMap = JSON.parse(fs.readFileSync(BINDING_MAP_PATH, 'utf-8'));
    } else {
        // Fallback usually shouldn't happen based on Phase D
        console.warn('WARNING: CATEGORY_BINDING_MAP.json not found.');
    }

    const categoryFiles = await glob(path.join(DOCS_DIR, '**/_category_.json'));
    stats.totalCategories = categoryFiles.length;

    const indexBindings: Record<string, any> = {};

    for (const catFile of categoryFiles) {
        const dir = path.dirname(catFile);
        const relativeDir = path.relative(DOCS_DIR, dir); // e.g., 04-observability

        console.log(`Processing: ${relativeDir}`);

        let catContent: CategoryJson;
        try {
            catContent = JSON.parse(fs.readFileSync(catFile, 'utf-8'));
        } catch (e) {
            console.error(`Error parsing ${catFile}: ${e}`);
            continue;
        }

        const label = catContent.label || path.basename(dir);
        const docStatus = catContent.customProps?.doc_status || 'informative';
        const semantics = catContent.customProps?.category_semantics || {};

        // 2. Prepare Alignment Data (R2)
        let alignment = bindingMap[relativeDir] || { schema_refs: [], invariant_refs: [], golden_refs: [], code_refs: { ts: [], py: [] } };
        let isWeak = false;

        // Fallback: From category_semantics evidence if map is empty
        if (!hasEvidence(alignment)) {
            // Logic to extract from semantics.guaranteed_behaviors if needed
            // For Strict v1.0, allowed to default to WEAK if still empty
        }

        if (!hasEvidence(alignment)) {
            // WEAK BINDING Fallback
            isWeak = true;
            stats.weakBindings++;
            alignment.schema_refs = ['https://schemas.mplp.dev/v1.0/mplp-core.schema.json']; // Simplified ID
        }

        // 3. Step 2 in Plan: Check/Create Index Doc (R6)
        const indexMdxPath = path.join(dir, 'index.mdx');
        const indexMdPath = path.join(dir, 'index.md');
        const readmePath = path.join(dir, 'README.md');
        const readmeMdxPath = path.join(dir, 'README.mdx');

        // DocId Calculation (R5): relative path from docs/docs to dir/index (no ext)
        // FIX: Docusaurus strips number prefixes from folder names for IDs (e.g. 01-architecture -> architecture).
        const sanitizedDir = relativeDir.split(path.sep).map(s => s.replace(/^\d+-/, '')).join('/');

        // REVERT: Link ID must match the FILE ID (folder/index), not just the folder, for Docusaurus to resolve it.
        let targetDocId = `${sanitizedDir}/index`;
        let targetSlug = `/${sanitizedDir}`; // Slug is clean "/architecture"

        let action = '';

        // FORCE REGEN: Comment out check to ensure all index pages are updated with new slugs/hidden status
        // if (fs.existsSync(indexMdxPath) || fs.existsSync(indexMdPath)) {
        if (false) {
            // R6: SKIPPED_EXISTING_INDEX
            action = 'SKIPPED_EXISTING_INDEX';
            stats.reusedExistingIndex++;
            upgradeLogs.push(`- [SKIP] ${relativeDir}: Existing index found.`);
            // No overwrite.
        } else if (fs.existsSync(readmePath) || fs.existsSync(readmeMdxPath)) {
            // R6: WRAP_README
            action = 'WRAP_README';

            const scopeText = `See ${path.basename(readmePath)} for details.`;
            const template = generateIndexTemplate({
                slug: targetSlug,
                label,
                doc_status: docStatus,
                alignment,
                scope_text: scopeText,
                guaranteed_behaviors: [],
                explicit_non_claims: []
            });
            fs.writeFileSync(indexMdxPath, template);
            stats.createdIndexPages++;
            upgradeLogs.push(`- [CREATE/WRAP] ${relativeDir}: Generated index.mdx wrapping README.`);
        } else {
            // Gen New
            action = 'CREATED_INDEX';
            stats.createdIndexPages++;

            const scopeText = semantics.scope || catContent.link.description || 'No detailed scope definition available for this section.';
            const guarantees = semantics.guaranteed_behaviors?.map((g: any) => g.statement) || [];
            const nonClaims = semantics.explicit_non_claims || [];

            const template = generateIndexTemplate({
                slug: targetSlug,
                label,
                doc_status: docStatus,
                alignment,
                scope_text: scopeText,
                guaranteed_behaviors: guarantees,
                explicit_non_claims: nonClaims
            });

            fs.writeFileSync(indexMdxPath, template);
            upgradeLogs.push(`- [CREATE] ${relativeDir}: Generated index.mdx (${isWeak ? 'WEAK' : 'STRONG'}).`);
        }

        // 4. Update _category_.json (Step 3, R5)
        // Must use 'doc' and id = targetDocId
        if (catContent.link.type !== 'doc' || catContent.link.id !== targetDocId) {
            catContent.link = {
                type: 'doc',
                id: targetDocId
            };
            fs.writeFileSync(catFile, JSON.stringify(catContent, null, 2));
            stats.updatedCategories++;
        }

        // 5. Accumulate Report
        indexBindings[targetDocId] = {
            category: relativeDir,
            alignment: alignment,
            status: action
        };
    }

    // Write Outputs
    fs.writeFileSync(BINDINGS_OUTPUT_PATH, JSON.stringify(indexBindings, null, 2));

    const reportContent = `
# Category Index Doc Upgrade Report v1.0

**Date**: ${new Date().toISOString()}

## Summary
- **Total Categories**: ${stats.totalCategories}
- **Created Index Pages**: ${stats.createdIndexPages}
- **Reused Existing**: ${stats.reusedExistingIndex}
- **Weak Bindings**: ${stats.weakBindings}
- **Category JSONs Updated**: ${stats.updatedCategories}

## Execution Logs
${upgradeLogs.join('\n')}
`;
    fs.writeFileSync(REPORT_OUTPUT_PATH, reportContent);

    console.log('Upgrade Complete.');
    console.log(`Report: ${REPORT_OUTPUT_PATH}`);
}

function hasEvidence(alignment: any): boolean {
    return (alignment.schema_refs?.length > 0 ||
        alignment.invariant_refs?.length > 0 ||
        alignment.golden_refs?.length > 0 ||
        alignment.code_refs?.ts?.length > 0 ||
        alignment.code_refs?.py?.length > 0);
}

// R3 & R4: Template
function generateIndexTemplate(data: any): string {
    const { slug, label, doc_status, alignment, scope_text, guaranteed_behaviors, explicit_non_claims } = data;

    // Helper to format YAML refs
    const schemaYaml = alignment.schema_refs?.map((s: any) =>
        typeof s === 'string' ? `    - id: ${s}\n      version: v1.0.0` : `    - id: ${s.id}\n      version: ${s.version}`
    ).join('\n') || '';

    const invariantYaml = alignment.invariant_refs?.map((s: string) => `    - ${s}`).join('\n') || '';
    const goldenYaml = alignment.golden_refs?.map((s: string) => `    - ${s}`).join('\n') || '';
    const codeTsYaml = alignment.code_refs?.ts?.map((s: string) => `      - ${s}`).join('\n') || '';
    const codePyYaml = alignment.code_refs?.py?.map((s: string) => `      - ${s}`).join('\n') || '';

    // Counts
    const sCount = alignment.schema_refs?.length || 0;
    const iCount = alignment.invariant_refs?.length || 0;
    const gCount = alignment.golden_refs?.length || 0;
    const cTsCount = alignment.code_refs?.ts?.length || 0;
    const cPyCount = alignment.code_refs?.py?.length || 0;

    // Guarantees Logic
    let guaranteesSection = '';
    if (guaranteed_behaviors && guaranteed_behaviors.length > 0) {
        guaranteesSection = guaranteed_behaviors.map((g: string) => `- ${g}`).join('\n');
    } else {
        guaranteesSection = '- This section adds no new protocol guarantees; serves as navigation index. See bound evidence for normative rules.';
    }

    // Non-Claims Logic
    let nonClaimsSection = '';
    if (explicit_non_claims && explicit_non_claims.length > 0) {
        nonClaimsSection = explicit_non_claims.map((g: string) => `- ${g}`).join('\n');
    } else {
        nonClaimsSection = '- Does not claim any normative constraints not explicitly bound in schema / invariants / golden flows.';
    }

    return `---
slug: ${slug}
title: ${label}
sidebar_class_name: hidden
doc_status: ${doc_status}
doc_role: category_index
protocol_version: 1.0.0
truth_level: T2
protocol_alignment:
  schema_refs:
${schemaYaml}
  invariant_refs:
${invariantYaml}
  golden_refs:
${goldenYaml}
  code_refs:
    ts:
${codeTsYaml}
    py:
${codePyYaml}
---

## Scope
${scope_text}

## Guaranteed Behaviors
${guaranteesSection}

## Explicit Non-Claims
${nonClaimsSection}

## Evidence Binding
- **Binding Source**: \`docs/reports/CATEGORY_BINDING_MAP.json\`
- **Schema Refs**: ${sCount}
- **Invariant Refs**: ${iCount}
- **Golden Refs**: ${gCount}
- **Code Refs (TS/Py)**: ${cTsCount} / ${cPyCount}

## Entry Points
Select a subsection from the sidebar. Recommended reading:
- Overview
- Invariants / Matrix / Reference (if applicable)
`;
}

main();
