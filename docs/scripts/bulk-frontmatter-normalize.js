const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '../docs');

const DIR_DEFAULTS = {
    '01-architecture': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L1' },
    '02-modules': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L2' },
    '03-profiles': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'Profile' },
    '04-observability': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
    '05-learning': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'CrossCutting' },
    '06-runtime': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L3' },
    '07-integration': { doc_status: 'normative', doc_role: 'normative_spec', spec_level: 'L4' },
    '08-guides': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '09-tests': { doc_status: 'normative', doc_role: 'test_spec', spec_level: 'N/A' },
    '10-sdk': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '11-examples': { doc_status: 'informative', doc_role: 'example', spec_level: 'N/A' },
    '12-governance': { doc_status: 'normative', doc_role: 'policy', spec_level: 'CrossCutting' },
    '13-release': { doc_status: 'informative', doc_role: 'release_note', spec_level: 'N/A' },
    '14-ops': { doc_status: 'informative', doc_role: 'ops', spec_level: 'N/A' },
    '99-meta': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
    '00-index': { doc_status: 'informative', doc_role: 'guide', spec_level: 'N/A' },
};

const EXCLUDES = new Set(['.DS_Store']);
const DRY_RUN = process.argv.includes('--dry-run');

function getTopDir(filePath) {
    const relPath = path.relative(DOCS_DIR, filePath);
    return relPath.split(path.sep)[0];
}

function readFileUtf8(p) {
    return fs.readFileSync(p, 'utf8');
}

function writeFileUtf8(p, s) {
    fs.writeFileSync(p, s, 'utf8');
}

function hasKey(frontmatter, key) {
    // key: value (allow spaces)
    const re = new RegExp(`^${escapeRegExp(key)}\\s*:`, 'm');
    return re.test(frontmatter);
}

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureFrontmatter(content, injectedLines) {
    // Returns { updatedContent, changed }
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);

    // No frontmatter: insert a new one at top
    if (!fmMatch) {
        const fm = ['---', ...injectedLines, '---', ''].join('\n');
        return { updatedContent: fm + content, changed: true };
    }

    const fmBody = fmMatch[1];
    const fmRaw = fmMatch[0];

    // Append missing keys without rewriting existing content
    const missing = [];
    for (const line of injectedLines) {
        const key = line.split(':')[0].trim();
        if (!hasKey(fmBody, key)) missing.push(line);
    }

    if (missing.length === 0) {
        return { updatedContent: content, changed: false };
    }

    // Insert missing lines at the end of frontmatter block (before closing ---)
    const newFmBody = fmBody.replace(/\s*$/, '') + '\n' + missing.join('\n') + '\n';
    const newFmRaw = `---\n${newFmBody}---\n`;

    const updatedContent = content.replace(fmRaw, newFmRaw);
    return { updatedContent, changed: true };
}

function processFile(filePath) {
    const content = readFileUtf8(filePath);

    const topDir = getTopDir(filePath);
    const defaults = DIR_DEFAULTS[topDir] || {};

    const injected = [];

    // protocol_version: always ensure exists
    injected.push(`protocol_version: "1.0.0"`);

    if (defaults.doc_status) injected.push(`doc_status: ${defaults.doc_status}`);
    if (defaults.doc_role) injected.push(`doc_role: ${defaults.doc_role}`);
    if (defaults.spec_level) injected.push(`spec_level: ${defaults.spec_level}`);

    // modules: must exist, can be empty
    injected.push(`modules: []`);

    const { updatedContent, changed } = ensureFrontmatter(content, injected);
    if (!changed) return;

    const rel = path.relative(DOCS_DIR, filePath);
    if (DRY_RUN) {
        console.log(`[dry-run] would update: ${rel}`);
        return;
    }

    writeFileUtf8(filePath, updatedContent);
    console.log(`Updated: ${rel}`);
}

function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
        if (EXCLUDES.has(name)) continue;
        const p = path.join(dir, name);
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else if (p.endsWith('.md') || p.endsWith('.mdx')) processFile(p);
    }
}

console.log(`Starting Frontmatter Normalization... ${DRY_RUN ? '(dry-run)' : ''}`);
if (!fs.existsSync(DOCS_DIR)) {
    console.error(`Docs dir not found: ${DOCS_DIR}`);
    process.exit(1);
}
walk(DOCS_DIR);
console.log('Done.');
