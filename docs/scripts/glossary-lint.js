const fs = require('fs');
const path = require('path');

const GLOSSARY_FILE = path.resolve(__dirname, '../docs/00-index/glossary-registry.yaml');
let hasError = false;

function readFileUtf8(p) {
    return fs.readFileSync(p, 'utf8');
}

// Simple YAML-like parser for the specific list-of-objects format
// This avoids 'js-yaml' dependency as requested for robust scripts without deps if possible
function parseGlossary(content) {
    const terms = [];
    let current = null;
    const lines = content.split('\n');

    for (const line of lines) {
        const trim = line.trim();
        if (trim.startsWith('- term_id:')) {
            if (current) terms.push(current);
            const val = trim.replace('- term_id:', '').trim().replace(/^"|"$/g, '');
            current = { term_id: val, __line: line };
        } else if (current) {
            // Very naive parser for other keys
            const match = trim.match(/^([a-z_]+):\s*(.*)$/);
            if (match) {
                const k = match[1];
                let v = match[2];
                if (v === '>') {
                    // Multiline start, ignore for simple lint existence check or handle generically
                    // We just record key existence
                    current[k] = 'MULTILINE';
                } else {
                    current[k] = v;
                }
            }
        }
    }
    if (current) terms.push(current);
    return terms;
}

console.log('Starting Glossary Lint...');

if (!fs.existsSync(GLOSSARY_FILE)) {
    console.error('FAIL: Glossary file not found.');
    process.exit(1);
}

const content = readFileUtf8(GLOSSARY_FILE);
const terms = parseGlossary(content);

const ids = new Set();

for (const t of terms) {
    // Check 1: Unique term_id
    if (ids.has(t.term_id)) {
        console.error(`FAIL: Duplicate term_id found: ${t.term_id}`);
        hasError = true;
    }
    ids.add(t.term_id);

    // Check 2: Normative Definition
    // If normative: true, MUST have normative_definition
    if (t.normative === 'true' || t.normative === true) { // parser might see string or bool
        if (!t.normative_definition) {
            console.error(`FAIL: Normative term '${t.term_id}' missing 'normative_definition'`);
            hasError = true;
        }

        // Check 3: Schema or Code Refs for normative terms (unless purely abstract?)
        // We can warn if both missing
        // if (!t.schema_refs && !t.code_refs) {
        //   console.warn(`WARN: Normative term '${t.term_id}' has no schema_refs or code_refs`);
        // }
    }
}

// Check 4: Header Metadata existence (manual check of file content top)
if (!content.includes('registry_type: "glossary"') && !content.includes('registry_type: glossary')) {
    console.error('FAIL: Missing registry_type in header');
    hasError = true;
}

if (hasError) {
    console.error('Glossary Lint Failed.');
    process.exit(1);
} else {
    console.log(`Glossary Lint Passed. Checked ${terms.length} terms.`);
}
