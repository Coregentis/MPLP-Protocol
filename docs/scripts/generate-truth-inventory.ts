
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const DOCS_REPORTS_DIR = path.resolve(__dirname, '../reports');

// Output Paths
const PATHS = {
    SCHEMA_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_SCHEMA_INDEX.json'),
    API_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_API_INDEX.json'),
    EVENT_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_EVENT_INDEX.json'),
    FLOW_INDEX: path.join(DOCS_REPORTS_DIR, 'TRUTH_FLOW_INDEX.json'),
};

// --- Helpers ---

function safeReadJson(filePath: string) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        console.warn(`Failed to parse JSON: ${filePath}`, e.message);
        return null;
    }
}

function safeReadFile(filePath: string) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.warn(`Failed to read file: ${filePath}`, e.message);
        return '';
    }
}

// --- Indexers ---

// 1. Schema Analysis
async function indexSchemas() {
    console.log('Indexing Schemas...');
    // Target both root schemas and sdk-ts schemas (though they might be duplicates, we index what's there)
    // Actually, documentation_tree shows schemas/v2 and packages/sdk-ts/schemas. 
    // We should prioritize root schemas/v2 as the source of truth if they exist, or just index all unique $ids.

    const patterns = [
        path.join(PROJECT_ROOT, 'schemas/**/*.json'),
        path.join(PROJECT_ROOT, 'packages/sdk-ts/schemas/**/*.json')
    ];

    const schemaFiles = await glob(patterns);
    const index: Record<string, any> = {};

    for (const file of schemaFiles) {
        const content = safeReadJson(file);
        if (!content || !content.$id) continue;

        const id = content.$id;
        if (index[id]) continue; // Deduplicate by ID

        index[id] = {
            filePath: path.relative(PROJECT_ROOT, file),
            title: content.title,
            type: content.type,
            properties: content.properties ? Object.keys(content.properties) : [],
            required: content.required || [],
            definitions: content.definitions ? Object.keys(content.definitions) : [],
            description: content.description
        };
    }
    return index;
}

// 2. API & Code Analysis
async function indexApi() {
    console.log('Indexing API & Code...');
    const apiIndex: any = { ts: {}, py: {} };

    // TS SDK
    const tsFiles = await glob(path.join(PROJECT_ROOT, 'packages/sdk-ts/src/**/*.ts'));
    for (const file of tsFiles) {
        const content = safeReadFile(file);
        const relPath = path.relative(PROJECT_ROOT, file);

        // Simple Regex extraction for exports
        // Matches: export class X, export interface Y, export type Z, export function W, export const V
        const exports: string[] = [];
        const exportRegex = /export\s+(class|interface|type|function|const|enum)\s+([a-zA-Z0-9_]+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(`${match[1]} ${match[2]}`);
        }

        if (exports.length > 0) {
            apiIndex.ts[relPath] = exports;
        }
    }

    // Python SDK
    const pyFiles = await glob(path.join(PROJECT_ROOT, 'packages/sdk-py/src/mplp/**/*.py'));
    for (const file of pyFiles) {
        const content = safeReadFile(file);
        const relPath = path.relative(PROJECT_ROOT, file);

        // Matches: class X, def Y (top level approximately)
        const defs: string[] = [];
        const classRegex = /^class\s+([a-zA-Z0-9_]+)/gm;
        const funcRegex = /^def\s+([a-zA-Z0-9_]+)/gm;

        let match;
        while ((match = classRegex.exec(content)) !== null) {
            defs.push(`class ${match[1]}`);
        }
        while ((match = funcRegex.exec(content)) !== null) {
            defs.push(`def ${match[1]}`);
        }

        if (defs.length > 0) {
            apiIndex.py[relPath] = defs;
        }
    }

    return apiIndex;
}

// 3. Behavioral Analysis (Events & Flows)
async function indexBehaviors() {
    console.log('Indexing Behaviors...');
    const eventIndex: Record<string, any> = {};
    const flowIndex: any = { golden: [], examples: [] };

    // Events: Scan for "type": "MPLP-..." or similar patterns in JSONs within examples/tests
    // or TypeScript definitions of events. 
    // Best proxy for "Actual Event Types" is scanning all schemas for things that look like events 
    // OR scanning code for explicit event string constants.
    // Let's rely on Schema definitions for Truth of Events, and Usage for verification.
    // For this index, we'll scan usages in Tests/Examples.

    const usageFiles = await glob([
        path.join(PROJECT_ROOT, 'tests/**/*.json'),
        path.join(PROJECT_ROOT, 'examples/**/*.json'),
        path.join(PROJECT_ROOT, 'packages/sdk-ts/tests/**/*.json') // fixtures
    ]);

    for (const file of usageFiles) {
        const content = safeReadJson(file);
        if (!content) continue;

        // Recursive search for objects with "type" starting with "MPLP"
        const findEvents = (obj: any, source: string) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
                obj.forEach(o => findEvents(o, source));
                return;
            }
            if (obj.type && typeof obj.type === 'string' && obj.type.startsWith('MPLP')) {
                if (!eventIndex[obj.type]) {
                    eventIndex[obj.type] = { sources: [] };
                }
                if (!eventIndex[obj.type].sources.includes(source)) {
                    eventIndex[obj.type].sources.push(source);
                }
            }
            Object.values(obj).forEach(v => findEvents(v, source));
        };

        findEvents(content, path.relative(PROJECT_ROOT, file));
    }

    // Flows: Index Golden Flows & Examples
    // Golden Flows
    const goldenDirs = await glob(path.join(PROJECT_ROOT, 'tests/golden/flows/*'));
    for (const dir of goldenDirs) {
        const readme = path.join(dir, 'README.md');
        const hasReadme = fs.existsSync(readme);
        flowIndex.golden.push({
            name: path.basename(dir),
            path: path.relative(PROJECT_ROOT, dir),
            hasReadme
        });
    }

    // Examples (Code)
    const exampleFiles = await glob([
        path.join(PROJECT_ROOT, 'examples/**/*.ts'),
        path.join(PROJECT_ROOT, 'examples/**/*.py'),
        path.join(PROJECT_ROOT, 'packages/sdk-ts/examples/**/*.ts'),
        path.join(PROJECT_ROOT, 'packages/sdk-py/examples/**/*.py')
    ]);

    for (const file of exampleFiles) {
        flowIndex.examples.push({
            path: path.relative(PROJECT_ROOT, file)
        });
    }

    return { eventIndex, flowIndex };
}

// --- Main ---

async function main() {
    if (!fs.existsSync(DOCS_REPORTS_DIR)) {
        fs.mkdirSync(DOCS_REPORTS_DIR, { recursive: true });
    }

    try {
        const schemaData = await indexSchemas();
        fs.writeFileSync(PATHS.SCHEMA_INDEX, JSON.stringify(schemaData, null, 2));
        console.log(`Wrote Schema Index to ${PATHS.SCHEMA_INDEX}`);

        const apiData = await indexApi();
        fs.writeFileSync(PATHS.API_INDEX, JSON.stringify(apiData, null, 2));
        console.log(`Wrote API Index to ${PATHS.API_INDEX}`);

        const { eventIndex, flowIndex } = await indexBehaviors();
        fs.writeFileSync(PATHS.EVENT_INDEX, JSON.stringify(eventIndex, null, 2));
        console.log(`Wrote Event Index to ${PATHS.EVENT_INDEX}`);

        fs.writeFileSync(PATHS.FLOW_INDEX, JSON.stringify(flowIndex, null, 2));
        console.log(`Wrote Flow Index to ${PATHS.FLOW_INDEX}`);

        console.log('Phase A Complete.');
    } catch (e) {
        console.error('Phase A Failed:', e);
        process.exit(1);
    }
}

main();
