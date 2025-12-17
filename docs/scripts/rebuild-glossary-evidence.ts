
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { glob } from 'glob';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DOCS_DIR = path.resolve(__dirname, '../');
const DOCS_REPORTS_DIR = path.join(DOCS_DIR, 'reports');
const GLOSSARY_PATH = path.join(DOCS_DIR, 'docs/00-index/glossary-registry.yaml');

// Input Paths (Phase A Outputs)
const PATHS = {
    SCHEMA_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_SCHEMA_INDEX.json'),
    API_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_API_INDEX.json'),
    EVENT_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_EVENT_INDEX.json'),
    FLOW_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_FLOW_INDEX.json'),
};

// Start Phase B
console.log('Starting Phase B: Glossary Evidence Rebuild...');

// Helpers
function safeReadJson(filePath: string) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { console.warn(`Failed to read JSON: ${filePath}`); return null; }
}

function safeReadYaml(filePath: string) {
    try { return yaml.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { console.warn(`Failed to read YAML: ${filePath}`); return null; }
}

const CANONICAL_BASE = 'https://schemas.mplp.dev/v1.0';

async function main() {
    // 1. Load Indices
    const schemaIndex = safeReadJson(PATHS.SCHEMA_INDEX) || {};
    const apiIndex = safeReadJson(PATHS.API_INDEX) || { ts: {}, py: {} };
    // const eventIndex = safeReadJson(PATHS.EVENT_INDEX); // Not strictly used for definition, valid for usage
    // const flowIndex = safeReadJson(PATHS.FLOW_INDEX);

    // 2. Build Canonical Schema ID Rewrite Map (Step B1)
    const canonicalMap: Record<string, string> = {};
    const filenameToSchemaId: Record<string, string> = {};

    console.log('Building Canonical ID Map...');
    for (const [id, schema] of Object.entries(schemaIndex)) {
        const fileBasename = path.basename((schema as any).filePath);
        filenameToSchemaId[fileBasename] = id;

        // Determine Canonical ID
        let canonicalId = id;
        if (id.startsWith('https://mplp.dev/schemas/v1.0/')) {
            canonicalId = id.replace('https://mplp.dev/schemas/v1.0/', CANONICAL_BASE + '/');
        } else if (!id.startsWith(CANONICAL_BASE)) {
            // If it's something else entirely, try to force it or keep as is? 
            // User example: mplp-trace.schema.json -> https://schemas.mplp.dev/v1.0/mplp-trace.schema.json
            // We'll trust the ID if it matches base, else rewrite if it looks like a v1 schema
        }

        if (id !== canonicalId) {
            canonicalMap[id] = canonicalId;
        }
    }

    fs.writeFileSync(path.join(DOCS_REPORTS_DIR, 'GLOSSARY_CANONICAL_ID_REWRITE_MAP.json'), JSON.stringify(canonicalMap, null, 2));


    // 3. Process Glossary (Step B2, B3, B4)
    const glossary = safeReadYaml(GLOSSARY_PATH);
    if (!glossary || !glossary.terms) {
        console.error('Failed to load Glossary Registry.');
        process.exit(1);
    }

    const newTerms: any[] = [];
    const orphans: any[] = [];
    const blockers: any[] = [];

    console.log('Processing Terms...');

    for (const entry of glossary.terms) {
        const key = entry.term_id || entry.key; // Normalize to 'key'
        const term = entry.term;

        const newEntry: any = {
            key: key,
            term: term,
            aliases: entry.aliases || [],
            // Definition is now strictly derived or null placeholder
            definition: {
                source: 'schema',
                summary: 'Pending Schema Derivation'
            },
            definition_source: null,
            usage_evidence: {
                code: { ts: [], py: [] },
                tests: [],
                examples: []
            }
        };

        // --- B3: Establish Definition Source ---
        let schemaId: string | null = null;
        let matchStrength = 'none';
        let matchReason = '';

        // Strategy A: Check existing schema_refs
        if (entry.schema_refs && entry.schema_refs.length > 0) {
            // Refs often look like "mplp-context.schema.json#/definitions/PSG"
            const ref = entry.schema_refs[0];
            const [refFile, refPath] = ref.split('#');

            // Try resolving via filename map
            if (filenameToSchemaId[refFile]) {
                schemaId = filenameToSchemaId[refFile];
                matchStrength = 'strong';
                matchReason = `Explicit ref to ${refFile}`;
            }
        }

        // Strategy B: Match by Title/Term similarity (if Strategy A failed)
        if (!schemaId) {
            for (const [sId, schema] of Object.entries(schemaIndex) as [string, any]) {
                if (schema.title && schema.title.toLowerCase().includes(term.toLowerCase())) {
                    schemaId = sId;
                    matchStrength = 'strong';
                    matchReason = `Title match: ${schema.title}`;
                    break;
                }
            }
        }

        // Strategy C: Match by Property (Weak)
        if (!schemaId) {
            // Heuristic: check if 'term_id' suffix matches a property? e.g. mplp.psg -> psg?
            // Or key matches property?
            const suffix = key.split('.').pop();
            for (const [sId, schema] of Object.entries(schemaIndex) as [string, any]) {
                if (schema.properties && schema.properties.includes(suffix)) {
                    schemaId = sId;
                    matchStrength = 'medium';
                    matchReason = `Property match: ${suffix}`;
                    break;
                }
            }
        }

        if (schemaId) {
            // Apply Canonical Rewrite
            const canonicalId = canonicalMap[schemaId] || schemaId;
            const schemaData = schemaIndex[schemaId];

            // Check Version Mismatch (Blocker)
            if (schemaData.title && schemaData.title.includes('v2.0')) {
                blockers.push({
                    key, term, schema_id: schemaId, reason: 'BLOCKER_MISMATCH_VERSION: Schema title indicates v2.0'
                });
            }

            newEntry.definition_source = {
                schema_id: canonicalId,
                file_path: schemaData.filePath,
                definition_strength: matchStrength,
                match_reason: matchReason
            };

            // STRICT: Overwrite definition with schema description
            if (schemaData.description) {
                newEntry.definition = {
                    source: 'schema',
                    summary: schemaData.description
                };
            } else {
                newEntry.definition = {
                    source: 'schema',
                    summary: `Defined in ${schemaData.title || canonicalId}`
                };
            }
        } else {
            orphans.push({ key, term, reason: 'No matching Schema definition found' });
        }


        // --- B4: Usage Evidence (Code/APIs) ---
        // Search TS
        for (const [file, exports] of Object.entries(apiIndex.ts) as [string, string[]][]) {
            // Simple heuristic: Does any export contain the term name (Pascal or Camel)?
            // Remove spaces from term: "Project Semantic Graph" -> "ProjectSemanticGraph"
            const pascalTerm = term.replace(/\s+/g, '');
            if (exports.some((e: string) => e.includes(pascalTerm)) || (entry.canonical && exports.some((e: string) => e.includes(entry.canonical)))) {
                newEntry.usage_evidence.code.ts.push(file);
            }
        }
        // Search Py
        for (const [file, defs] of Object.entries(apiIndex.py) as [string, string[]][]) {
            const pascalTerm = term.replace(/\s+/g, '');
            if (defs.some((d: string) => d.includes(pascalTerm) || d.includes(term.replace(/\s+/g, '_').toLowerCase()))) { // Py likely snake_case
                newEntry.usage_evidence.code.py.push(file);
            }
        }

        // Deduplicate Usage
        newEntry.usage_evidence.code.ts = [...new Set(newEntry.usage_evidence.code.ts)];
        newEntry.usage_evidence.code.py = [...new Set(newEntry.usage_evidence.code.py)];

        newTerms.push(newEntry);
    }

    // 4. Outputs

    // Write Updated Glossary
    glossary.terms = newTerms;
    // We update the governance metadata too? Usually kept as is.
    fs.writeFileSync(GLOSSARY_PATH, yaml.stringify(glossary));
    console.log(`Updated Glossary at ${GLOSSARY_PATH}`);

    // Generate Report
    const reportPath = path.join(DOCS_REPORTS_DIR, 'GLOSSARY_EVIDENCE_ALIGNMENT_REPORT_v1.0.md');
    let reportMd = `# Glossary Evidence Alignment Report v1.0\n\n`;
    reportMd += `## Summary\n`;
    reportMd += `- Total Terms: ${newTerms.length}\n`;
    reportMd += `- Mapped Terms: ${newTerms.length - orphans.length}\n`;
    reportMd += `- Orphans (FAIL): ${orphans.length}\n`;
    reportMd += `- Blockers: ${blockers.length}\n\n`;

    if (orphans.length > 0) {
        reportMd += `## Orphans (Action Required)\n`;
        orphans.forEach(o => reportMd += `- **${o.key}**: ${o.reason}\n`);
    }

    if (blockers.length > 0) {
        reportMd += `## Blockers (Immediate Fix Needed)\n`;
        blockers.forEach(b => reportMd += `- **${b.key}**: ${b.reason} (Schema: ${b.schema_id})\n`);
    }

    fs.writeFileSync(reportPath, reportMd);
    console.log(`Report generated at ${reportPath}`);

    fs.writeFileSync(path.join(DOCS_REPORTS_DIR, 'GLOSSARY_ORPHAN_TERMS.json'), JSON.stringify(orphans, null, 2));
    fs.writeFileSync(path.join(DOCS_REPORTS_DIR, 'GLOSSARY_BLOCKERS.json'), JSON.stringify(blockers, null, 2));

    if (orphans.length > 0 || blockers.length > 0) {
        console.error('Phase B FAILED: Orphans or Blockers detected.');
        process.exit(1);
    } else {
        console.log('Phase B PASSED.');
    }
}

main();
