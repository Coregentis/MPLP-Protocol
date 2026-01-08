import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const CLASSIFICATION_PATH = path.join(ROOT, 'docs-classification.json');

console.log(`ROOT: ${ROOT}`);
console.log(`CLASSIFICATION_PATH: ${CLASSIFICATION_PATH}`);

function loadClassification() {
    try {
        if (!fs.existsSync(CLASSIFICATION_PATH)) {
            console.error(`File not found: ${CLASSIFICATION_PATH}`);
            process.exit(1);
        }
        const content = fs.readFileSync(CLASSIFICATION_PATH, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error('Failed to load classification:', e);
        process.exit(1);
    }
}

function insertSections(content) {
    const lines = content.split('\n');
    let h1Index = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
            h1Index = i;
            break;
        }
    }

    if (h1Index === -1) return content;

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

    const hasNotice = /#+\s+Interpretation Notice/i.test(content);
    const hasNonClaims = /#+\s+Non-Claims/i.test(content);

    if (!hasNotice) {
        newSections += `\n\n## Interpretation Notice\n\nThis document provides an informative mapping between MPLP and the referenced standard. It does not replace or modify the authoritative text of either specification.\n`;
    }
    if (!hasNonClaims) {
        newSections += `\n\n## Non-Claims\n\nThis mapping is descriptive only. Conformance to MPLP does not automatically imply compliance with the referenced standard, and vice versa.\n`;
    }

    if (newSections === '') return content;

    return `${pre}${newSections}\n${post}`;
}

function main() {
    console.log('Starting standards mapping fix...');
    const data = loadClassification();
    const items = data.items;
    let modifiedCount = 0;

    items.forEach(item => {
        if (!item.path.includes('15-standards/')) return;

        const fullPath = path.join(ROOT, item.path);
        if (!fs.existsSync(fullPath)) {
            console.warn(`File not found: ${fullPath}`);
            return;
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = insertSections(content);

        if (newContent !== content) {
            fs.writeFileSync(fullPath, newContent);
            console.log(`Fixed standards mapping: ${item.path}`);
            modifiedCount++;
        }
    });

    console.log(`Standards mapping fix complete. Modified ${modifiedCount} files.`);
}

main();
