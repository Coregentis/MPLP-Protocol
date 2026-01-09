import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DOCS_ROOT = path.join(ROOT, 'docs/docs');

const VALID_TYPES = new Set(['normative', 'informative', 'governance', 'reference', 'internal_ops']);

function readFrontmatterDocType(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!match) return null;
    const fm = match[1];
    const t = fm.match(/^\s*doc_type:\s*(\w+)\s*$/m);
    if (!t) return null;
    const v = t[1].trim();
    return VALID_TYPES.has(v) ? v : '__invalid__';
}

function shouldPromoteLearningToNormative(relPath, content) {
    const lower = relPath.toLowerCase();
    if (!lower.includes('invariant')) return false;
    if (!/(MUST|SHALL|SHOULD|MUST NOT|SHOULD NOT)/.test(content)) return false;
    return true;
}

function shouldPromoteIntegrationToNormative(relPath, content) {
    const hints = [
        'Protocol:', 'Schema:', 'Event:', 'MUST', 'MUST NOT', 'Required', 'Normative'
    ];
    const score = hints.reduce((acc, h) => acc + (content.includes(h) ? 1 : 0), 0);
    return score >= 3;
}

function classifyByPath(relPath, content) {
    const p = relPath.replace(/\\/g, '/');

    if (p.startsWith('99-internal/')) return 'internal_ops';
    if (p === 'intro.mdx') return 'informative';
    if (p.startsWith('99-meta/')) return 'informative';

    if (p.startsWith('01-architecture/')) return 'normative';
    if (p.startsWith('02-modules/')) return 'normative';
    if (p.startsWith('03-profiles/')) return 'normative';
    if (p.startsWith('04-observability/')) return 'normative';
    if (p.startsWith('06-golden-flows/')) return 'normative';
    if (p.startsWith('14-runtime/')) return 'normative';

    if (p.startsWith('12-governance/')) return 'governance';

    if (p.startsWith('09-tests/')) return 'reference';
    if (p.startsWith('10-sdk/')) return 'reference';
    if (p.startsWith('00-index/')) return 'reference';

    if (p.startsWith('15-standards/')) return 'informative';
    if (p.startsWith('08-guides/')) return 'informative';
    if (p.startsWith('11-examples/')) return 'informative';
    if (p.startsWith('16-compliance/')) return 'informative';
    if (p.startsWith('17-enterprise/')) return 'informative';
    if (p.startsWith('18-adoption/')) return 'informative';

    if (p.startsWith('13-release/')) {
        if (/freeze|governance|runbook|checklist/i.test(p) || /DGP-\d+/i.test(content)) return 'governance';
        return 'informative';
    }

    if (p.startsWith('05-learning/')) {
        return shouldPromoteLearningToNormative(p, content) ? 'normative' : 'informative';
    }

    if (p.startsWith('07-integration/')) {
        return shouldPromoteIntegrationToNormative(p, content) ? 'normative' : 'reference';
    }

    return null;
}

function determineNormativeRole(docType, relPath) {
    if (docType !== 'normative') return { role: null, inherits: null };

    const p = relPath.replace(/\\/g, '/');
    const basename = path.basename(p, path.extname(p));
    const dirname = path.dirname(p);

    // Root detection heuristics
    // 1. index.md / index.mdx
    // 2. overview.md
    // 3. filename matches directory name (e.g. 02-modules/core-module.md is NOT root of 02-modules, but maybe root of itself?)
    // Actually, for DGP-08 inheritance, we want a clear "Root" for the section.

    // Architecture: architecture-overview.md is root
    if (p.includes('architecture-overview.md')) return { role: 'root', inherits: null };

    // Modules: core-module.md, context-module.md etc are roots of their own domain?
    // Or is there a modules-overview?
    // Let's assume any file that is NOT an index/overview but is in a subdirectory might be a subpage.

    // Better heuristic:
    // If it's in a subdirectory of a normative root dir (e.g. 01-architecture/cross-cutting/...), it inherits from the root of that section.

    if (p.startsWith('01-architecture/')) {
        if (basename === 'architecture-overview') return { role: 'root', inherits: null };
        return { role: 'subpage', inherits: 'docs/docs/01-architecture/architecture-overview.md' };
    }

    // For modules, they are part of the core architecture.
    // Since there is no modules-overview, they inherit from architecture-overview.
    if (p.startsWith('02-modules/')) {
        return { role: 'subpage', inherits: 'docs/docs/01-architecture/architecture-overview.md' };
    }

    if (p.startsWith('03-profiles/')) {
        if (basename === 'sa-events') return { role: 'subpage', inherits: 'docs/docs/03-profiles/sa-profile.md' };
        if (basename === 'map-events') return { role: 'subpage', inherits: 'docs/docs/03-profiles/map-profile.md' };
        return { role: 'root', inherits: null };
    }

    if (p.startsWith('04-observability/')) {
        if (basename === 'observability-overview') return { role: 'root', inherits: null };
        return { role: 'subpage', inherits: 'docs/docs/04-observability/observability-overview.md' };
    }

    if (p.startsWith('06-golden-flows/')) {
        if (basename === 'index') return { role: 'root', inherits: null };
        return { role: 'subpage', inherits: 'docs/docs/06-golden-flows/index.mdx' };
    }

    if (p.startsWith('14-runtime/')) {
        if (basename === 'runtime-glue-overview') return { role: 'root', inherits: null };
        // If no overview found, maybe default to runtime-glue-overview if it exists?
        // Or treat as root if unsure.
        // Let's treat as subpage of runtime-glue-overview for now, assuming it exists.
        return { role: 'subpage', inherits: 'docs/docs/14-runtime/runtime-glue-overview.md' };
    }

    // Default for other normative docs (promoted ones)
    return { role: 'root', inherits: null };
}

function getTags(docType, p) {
    const tags = [];
    if (p.startsWith('15-standards/')) tags.push('standards-mapping');
    if (docType === 'normative') {
        const { role } = determineNormativeRole(docType, p);
        if (role === 'root') tags.push('normative-root');
        if (role === 'subpage') tags.push('normative-subpage');
    }
    return tags;
}

function getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
        } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
            results.push(fullPath);
        }
    });
    return results;
}

function main() {
    console.log('Scanning docs for governance classification...');
    const files = getAllFiles(DOCS_ROOT);
    const classification = {
        schema_version: "1.0.0",
        protocol_version: "1.0.0",
        generated_at: new Date().toISOString(),
        root_dir: "docs/docs",
        items: []
    };

    files.forEach(file => {
        const relativePath = path.relative(DOCS_ROOT, file).replace(/\\/g, '/');
        const content = fs.readFileSync(file, 'utf8');

        let docType = readFrontmatterDocType(content);
        if (!docType || docType === '__invalid__') {
            docType = classifyByPath(relativePath, content);
        }

        const { role, inherits } = determineNormativeRole(docType, relativePath);
        const tags = getTags(docType, relativePath);

        let authority = 'Documentation Governance';
        let status = 'active';

        if (docType === 'normative') {
            authority = 'MPGC';
            status = 'frozen';
        } else if (docType === 'governance') {
            status = 'frozen';
        } else if (docType === 'internal_ops') {
            authority = 'Internal';
        }

        classification.items.push({
            path: `docs/docs/${relativePath}`,
            doc_type: docType || 'unknown',
            status: status,
            authority: authority,
            normative_role: role,
            inherits_from: inherits,
            tags: tags
        });
    });

    const jsonPath = path.join(ROOT, 'docs-classification.json');
    fs.writeFileSync(jsonPath, JSON.stringify(classification, null, 2));
    console.log(`Generated classification for ${files.length} files.`);
}

main();
