const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');
const EXCLUDES = new Set(['.DS_Store']);

const REQUIRED_KEYS = [
    'protocol_version',
    'doc_status',
    'doc_role',
    'spec_level',
    'modules'
];

let hasError = false;

function readFileUtf8(p) {
    return fs.readFileSync(p, 'utf8');
}

function checkFile(filePath) {
    const content = readFileUtf8(filePath);
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);

    const rel = path.relative(DOCS_DIR, filePath);

    if (!fmMatch) {
        console.error(`FAIL: No frontmatter in ${rel}`);
        hasError = true;
        return;
    }

    const fmBody = fmMatch[1];
    const missing = [];

    for (const key of REQUIRED_KEYS) {
        // Naive regex check usually capable enough for existence check
        const re = new RegExp(`^${key}\\s*:`, 'm');
        if (!re.test(fmBody)) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        console.error(`FAIL: ${rel} missing mandatory keys: ${missing.join(', ')}`);
        hasError = true;
    }
}

function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
        if (EXCLUDES.has(name)) continue;
        const p = path.join(dir, name);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else if (p.endsWith('.md') || p.endsWith('.mdx')) checkFile(p);
    }
}

console.log('Starting Frontmatter Lint...');
if (fs.existsSync(DOCS_DIR)) {
    walk(DOCS_DIR);
} else {
    console.error(`Docs dir not found: ${DOCS_DIR}`);
    process.exit(1);
}

if (hasError) {
    console.error('Lint Failed.');
    process.exit(1);
} else {
    console.log('Lint Passed.');
}
