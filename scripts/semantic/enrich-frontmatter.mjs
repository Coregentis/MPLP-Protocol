import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const CLASSIFICATION_PATH = path.join(ROOT, 'docs-classification.json');

function loadClassification() {
    return JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { fm: {}, body: content, hasFm: false };

    const fmRaw = match[1];
    const fm = {};
    fmRaw.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            fm[key] = val;
        }
    });

    const body = content.replace(match[0], '').trim();
    return { fm, body, hasFm: true };
}

function stringifyFrontmatter(fm) {
    let output = '---\n';
    for (const [key, val] of Object.entries(fm)) {
        output += `${key}: ${val}\n`;
    }
    output += '---\n\n';
    return output;
}

function generateDescription(body) {
    // Remove headers, blockquotes, code blocks
    let text = body
        .replace(/^#+ .*$/gm, '')
        .replace(/^> .*$/gm, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\n+/g, ' ')
        .trim();

    if (text.length > 157) {
        return text.substring(0, 157) + '...';
    }
    return text;
}

function main() {
    const items = loadClassification();
    let modifiedCount = 0;

    items.forEach(item => {
        if (item.doc_type === 'internal_ops' || item.doc_type === 'unknown') return;

        const fullPath = path.join(ROOT, 'docs/docs', item.path);
        if (!fs.existsSync(fullPath)) {
            console.error(`File not found: ${fullPath}`);
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const { fm, body, hasFm } = parseFrontmatter(content);

        // Enforce Governance Rules
        fm.doc_type = item.doc_type;

        if (item.doc_type === 'normative') {
            fm.status = 'frozen';
            fm.authority = 'MPGC';
        } else if (item.doc_type === 'governance') {
            fm.status = 'frozen';
            fm.authority = 'Documentation Governance';
        } else if (item.doc_type === 'informative' || item.doc_type === 'reference') {
            fm.status = 'active'; // Informative docs are active/living
            fm.authority = 'Documentation Governance';
        }

        // HARD GATE: Check for illegal status assignment
        if ((item.doc_type === 'normative' || item.doc_type === 'governance') && fm.status !== 'frozen') {
            console.error(`❌ CRITICAL GOVERNANCE VIOLATION: Attempted to assign status '${fm.status}' to ${item.doc_type} doc: ${item.path}`);
            process.exit(1);
        }

        // SEO Enrichment
        if (!fm.description) {
            fm.description = generateDescription(body);
        }

        // Canonical URL construction (assuming docs root)
        // Remove .md extension and index
        let slug = item.path.replace(/\\/g, '/').replace(/\.mdx?$/, '');
        if (slug.endsWith('/index')) slug = slug.replace('/index', '');
        fm.canonical = `/docs/${slug}`;

        // Reconstruct content
        const newFmStr = stringifyFrontmatter(fm);
        const newContent = newFmStr + body;

        if (newContent !== content) {
            fs.writeFileSync(fullPath, newContent);
            console.log(`Enriched: ${item.path}`);
            modifiedCount++;
        }
    });

    console.log(`Frontmatter enrichment complete. Modified ${modifiedCount} files.`);
}

main();
