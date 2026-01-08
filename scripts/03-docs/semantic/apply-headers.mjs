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

function getTitle(content) {
    const match = content.match(/^# (.*$)/m);
    return match ? match[1] : 'Untitled';
}

function extractDgpId(content) {
    const match = content.match(/\*\*ID\*\*: (DGP-\d+)/);
    return match ? match[1] : 'DGP-XX';
}

function generateNormativeHeader(title) {
    return `# ${title}

> **Status**: Normative
> **Version**: 1.0.0
> **Authority**: MPGC
> **Protocol**: MPLP v1.0.0 (Frozen)`;
}

function generateGovernanceHeader(title, dgpId) {
    return `# ${title}

**ID**: ${dgpId}
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21`;
}

function generateInformativeHeader(title) {
    return `# ${title}

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance`;
}

function replaceHeader(content, newHeader) {
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    if (lines[0].trim() === '---') {
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                frontmatterEnd = i;
                break;
            }
        }
    }

    const bodyStartIndex = frontmatterEnd + 1;
    let body = lines.slice(bodyStartIndex).join('\n');

    // 1. Remove legacy alerts/headers from anywhere in the body
    // Legacy patterns: 
    // > [!FROZEN] ... (multiline blockquote)
    // > [!IMPORTANT] ...
    // > **Status**: ... (existing standard headers)

    // We remove any blockquote block that looks like a header
    // A header block is a contiguous block of '>' lines containing specific keywords

    const legacyPatterns = [
        /> \[!FROZEN\][\s\S]*?(?=\n\n|\n$)/g,
        /> \[!IMPORTANT\][\s\S]*?(?=\n\n|\n$)/g,
        /> \*\*Status\*\*:[\s\S]*?(?=\n\n|\n$)/g,
        /\*\*ID\*\*: DGP-[\s\S]*?(?=\n\n|\n$)/g // Governance header without blockquote
    ];

    legacyPatterns.forEach(pattern => {
        body = body.replace(pattern, '').trim();
    });

    // 2. Find H1
    const h1Match = body.match(/^(# .*?)(\n|$)/m);
    if (!h1Match) return content; // No H1, abort

    // 3. Insert new header after H1
    // We need to be careful not to double-insert if we failed to remove the old one (unlikely with above regex)

    // Split body into pre-H1 (if any), H1, and post-H1
    const h1Index = body.indexOf(h1Match[0]);
    const preH1 = body.substring(0, h1Index).trim();
    const postH1 = body.substring(h1Index + h1Match[0].length).trim();

    // Reconstruct
    // Frontmatter
    // (Empty line)
    // Pre-H1 (should be empty usually, but maybe imports)
    // H1
    // (Empty line)
    // New Header
    // (Empty line)
    // Post H1

    const frontmatter = lines.slice(0, bodyStartIndex).join('\n');

    let newBody = '';
    if (preH1) newBody += preH1 + '\n\n';
    newBody += h1Match[1] + '\n\n';
    newBody += newHeader + '\n\n';
    newBody += postH1;

    return `${frontmatter}\n${newBody}`;
}

function main() {
    const items = loadClassification();
    let modifiedCount = 0;

    items.forEach(item => {
        const fullPath = path.join(ROOT, 'docs/docs', item.path);
        let content = fs.readFileSync(fullPath, 'utf8');
        const title = getTitle(content);
        let newHeader = '';

        if (item.doc_type === 'normative') {
            newHeader = generateNormativeHeader(title);
        } else if (item.doc_type === 'governance') {
            const dgpId = extractDgpId(content);
            newHeader = generateGovernanceHeader(title, dgpId);
        } else if (item.doc_type === 'informative' || item.doc_type === 'reference') {
            newHeader = generateInformativeHeader(title);
        } else {
            return; // Skip unknown or internal_ops
        }

        // Always apply replacement logic to ensure standardization
        const newContent = replaceHeader(content, newHeader);

        // Only write if changed
        // We normalize newlines to avoid false positives
        if (newContent.replace(/\r\n/g, '\n').trim() !== content.replace(/\r\n/g, '\n').trim()) {
            fs.writeFileSync(fullPath, newContent);
            console.log(`Updated: ${item.path}`);
            modifiedCount++;
        }
    });

    console.log(`Header standardization complete. Modified ${modifiedCount} files.`);
}

main();
