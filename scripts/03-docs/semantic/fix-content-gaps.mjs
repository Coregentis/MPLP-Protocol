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

function insertSections(content, type, title) {
    // Find insertion point: After Header Block
    // Header block ends after the last blockquote following H1

    const lines = content.split('\n');
    let h1Index = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
            h1Index = i;
            break;
        }
    }

    if (h1Index === -1) return content; // No H1, skip

    let insertIndex = h1Index + 1;
    while (insertIndex < lines.length) {
        const line = lines[insertIndex].trim();
        if (line === '' || line.startsWith('>')) {
            insertIndex++;
        } else {
            break;
        }
    }

    const pre = lines.slice(0, insertIndex).join('\n');
    const post = lines.slice(insertIndex).join('\n');

    let newSections = '';

    if (type === 'normative') {
        const hasScope = /#+\s+Scope/i.test(content);
        const hasNonGoals = /#+\s+Non-Goals/i.test(content);

        if (!hasScope) {
            newSections += `\n\n## 1. Scope\n\nThis specification defines the normative requirements for **${title}**.\n`;
        }
        if (!hasNonGoals) {
            newSections += `\n\n## 2. Non-Goals\n\nThis specification does not mandate specific implementation details beyond the defined interfaces and invariants.\n`;
        }
    } else if (type === 'standards') {
        const hasNotice = /#+\s+Interpretation Notice/i.test(content);
        const hasNonClaims = /#+\s+Non-Claims/i.test(content);

        if (!hasNotice) {
            newSections += `\n\n## Interpretation Notice\n\nThis document provides a mapping between MPLP and external standards. It is informative and does not replace the authoritative text of either specification.\n`;
        }
        if (!hasNonClaims) {
            newSections += `\n\n## Non-Claims\n\nCompliance with MPLP does not automatically guarantee compliance with external standards.\n`;
        }
    }

    if (newSections === '') return content;

    return `${pre}${newSections}\n${post}`;
}

function main() {
    const items = loadClassification();
    let modifiedCount = 0;

    items.forEach(item => {
        if (item.doc_type === 'internal_ops' || item.doc_type === 'unknown') return;

        const fullPath = path.join(ROOT, 'docs/docs', item.path);
        if (!fs.existsSync(fullPath)) return;

        let content = fs.readFileSync(fullPath, 'utf8');
        const title = getTitle(content);
        let newContent = content;

        if (item.doc_type === 'normative') {
            newContent = insertSections(content, 'normative', title);
        }

        if (item.path.startsWith('15-standards/')) {
            newContent = insertSections(content, 'standards', title);
        }

        if (newContent !== content) {
            fs.writeFileSync(fullPath, newContent);
            console.log(`Fixed content gaps: ${item.path}`);
            modifiedCount++;
        }
    });

    console.log(`Content gap fix complete. Modified ${modifiedCount} files.`);
}

main();
