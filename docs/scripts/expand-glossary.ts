
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DOCS_DIR = path.resolve(__dirname, '../');
const DOCS_REPORTS_DIR = path.join(DOCS_DIR, 'reports');

const PATHS = {
    SCHEMA_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_SCHEMA_INDEX.json'),
    GLOSSARY_REGISTRY: path.join(DOCS_DIR, 'docs/00-index/glossary-registry.yaml'),
};

console.log('Starting Phase E0: Glossary Expansion...');

// Helpers
function safeReadJson(filePath: string) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { console.warn(`Failed to read JSON: ${filePath}`); return null; }
}

function safeReadYaml(filePath: string) {
    try { return yaml.parse(fs.readFileSync(filePath, 'utf-8')); }
    catch (e) { return null; }
}

function generateNeutralDefinition(schema: any): string {
    if (schema.description) {
        // Truncate to first sentence or reasonable length
        const firstSentence = schema.description.split('.')[0] + '.';
        return firstSentence;
    }
    return `The normative schema definition for ${schema.title || 'this entity'}.`;
}

async function main() {
    // 1. Load Inputs
    const schemaIndex = safeReadJson(PATHS.SCHEMA_INDEX) || {};
    let glossaryRegistry = safeReadYaml(PATHS.GLOSSARY_REGISTRY) || { terms: [] };

    // Convert current glossary to map for easy checking
    const existingTerms = new Map(glossaryRegistry.terms.map((t: any) => [t.term_id, t]));

    // 2. Iterate Schemas and promote to Terms
    const newTerms: any[] = [];

    for (const [id, schema] of Object.entries(schemaIndex) as [string, any]) {
        // Filter: We only want "Core" concepts, not every utility definition.
        // Good heuristic: Top-level schemas (those with $id ending in .json)
        // or Schemas with specific Titles like "Context Module", "Plan Module".

        if (!id.startsWith('https://schemas.mplp.dev')) continue; // Skip non-canonical if any? Phase B should have fixed this.
        if (id.includes('v2.0') && !id.includes('learning')) continue; // Avoid generic v2 pollution unless strictly managed?

        const title = schema.title || '';
        const fileName = path.basename(schema.filePath);

        let termId = '';
        let termName = '';

        // Strategy: mplp.<module>.<entity>
        // Extract module name from file path or ID
        // e.g. packages/sdk-ts/schemas/mplp-context.schema.json -> module: context
        // e.g. packages/sdk-ts/schemas/events/mplp-sa-event.schema.json -> module: events -> sa-event

        const namePart = fileName.replace('mplp-', '').replace('.schema.json', '').replace('.json', '');

        if (fileName.includes('event')) {
            termId = `mplp.events.${namePart}`;
            termName = title || `MPLP ${namePart.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}`;
        } else {
            termId = `mplp.core.${namePart}`; // Default to core or module name?
            // If it's a module root like mplp-context -> mplp.context?
            // Better: mplp.schema.${namePart}
            if (['context', 'plan', 'trace', 'role', 'confirm', 'collab', 'dialog', 'extension', 'core', 'network'].includes(namePart)) {
                termId = `mplp.module.${namePart}`;
                termName = `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} Module`;
            } else {
                termId = `mplp.object.${namePart}`;
                termName = title || namePart;
            }
        }

        // Normalization
        termId = termId.toLowerCase();

        // Skip if exists
        if (existingTerms.has(termId)) continue;

        // Create Term
        const newTerm = {
            term_id: termId,
            term: termName,
            canonical: true,
            normative: true,
            definition: generateNeutralDefinition(schema),
            definition_source: {
                source_type: 'schema',
                id: id, // The canonical Schema ID
                ref: schema.filePath
            },
            usage_evidence: {
                schema_refs: [id]
            }
        };

        newTerms.push(newTerm);
        existingTerms.set(termId, newTerm);
    }

    console.log(`Extracted ${newTerms.length} new terms from Schema Index.`);

    // 3. Write Back
    glossaryRegistry.terms = Array.from(existingTerms.values()).sort((a: any, b: any) => a.term_id.localeCompare(b.term_id));

    // Preserve Metadata
    // ... assumed preserved in object

    fs.writeFileSync(PATHS.GLOSSARY_REGISTRY, yaml.stringify(glossaryRegistry));
    console.log(`Updated Glossary Registry: ${PATHS.GLOSSARY_REGISTRY}`);
}

main();
