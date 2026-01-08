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

function main() {
    console.log('Applying inheritance headers...');
    const data = loadClassification();
    let modifiedCount = 0;

    data.items.forEach(item => {
        if (item.doc_type !== 'normative' || item.normative_role !== 'subpage' || !item.inherits_from) return;

        const fullPath = path.join(ROOT, item.path);
        if (!fs.existsSync(fullPath)) return;

        let content = fs.readFileSync(fullPath, 'utf8');

        // Check for local Scope/Non-Goals
        const hasLocalScope = /^##\s+Scope/m.test(content);
        const hasLocalNonGoals = /^##\s+Non-Goals/m.test(content);

        if (hasLocalScope && hasLocalNonGoals) {
            console.log(`Skipping ${item.path} (Has local Scope/Non-Goals)`);
            return;
        }

        // Construct Inherited Header
        // Grammar:
        // > **Status**: Normative
        // > **Version**: 1.0.0
        // > **Authority**: MPGC
        // > **Scope**: Inherited (from: <path>)
        // > **Non-Goals**: Inherited (from: <path>)

        const inheritedHeader = `> **Status**: Normative\n> **Version**: 1.0.0\n> **Authority**: MPGC\n> **Scope**: Inherited (from: ${item.inherits_from})\n> **Non-Goals**: Inherited (from: ${item.inherits_from})`;

        // Find and Replace existing Normative Header
        // Existing header (from clean-duplicates.mjs):
        // > **Status**: Normative
        // > **Version**: 1.0.0
        // > **Authority**: MPGC
        // > **Protocol**: MPLP v1.0.0 (Frozen)

        const standardHeaderRegex = /> \*\*Status\*\*: Normative\n> \*\*Version\*\*: 1\.0\.0\n> \*\*Authority\*\*: MPGC\n> \*\*Protocol\*\*: MPLP v1\.0\.0 \(Frozen\)/;

        if (standardHeaderRegex.test(content)) {
            const newContent = content.replace(standardHeaderRegex, inheritedHeader);
            fs.writeFileSync(fullPath, newContent);
            console.log(`Applied inheritance header: ${item.path}`);
            modifiedCount++;
        } else {
            // It might already have inheritance header or be malformed?
            // Let's check if it already matches inheritance
            if (content.includes('> **Scope**: Inherited')) {
                // Already done
            } else {
                console.warn(`Could not find standard normative header in ${item.path} to replace.`);
            }
        }
    });

    console.log(`Inheritance application complete. Modified ${modifiedCount} files.`);
}

main();
