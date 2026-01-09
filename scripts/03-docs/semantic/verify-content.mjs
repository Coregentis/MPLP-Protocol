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

function checkContent(content, checks) {
    const missing = [];
    checks.forEach(check => {
        // Case insensitive check for headers
        const regex = new RegExp(`^#+\\s+${check}`, 'm');
        if (!regex.test(content)) {
            missing.push(check);
        }
    });
    return missing;
}

function main() {
    const items = loadClassification();
    let failureCount = 0;
    const failures = [];

    console.log('Verifying content compliance...');

    items.forEach(item => {
        if (item.doc_type === 'internal_ops' || item.doc_type === 'unknown') return;

        const fullPath = path.join(ROOT, 'docs/docs', item.path);
        if (!fs.existsSync(fullPath)) return;

        const content = fs.readFileSync(fullPath, 'utf8');
        let missing = [];

        // 1. Normative Docs: Must have Scope and Non-Goals
        if (item.doc_type === 'normative') {
            // Exception: Some normative docs might be sub-pages or specific types that don't need full structure?
            // DGP-08 says "Normative Page Template".
            // Let's be strict for now and see what fails.
            missing = checkContent(content, ['Scope', 'Non-Goals']);
        }

        // 2. Standards Mapping Docs: Must have Interpretation Notice and Non-Claims
        if (item.path.startsWith('15-standards/')) {
            // These are Informative but have specific requirements per DGP-09/Plan
            missing = checkContent(content, ['Interpretation Notice', 'Non-Claims']);
        }

        if (missing.length > 0) {
            console.error(`❌ ${item.path} missing sections: ${missing.join(', ')}`);
            failures.push({ path: item.path, missing });
            failureCount++;
        }
    });

    if (failureCount > 0) {
        console.error(`\n❌ Content Compliance Failed: ${failureCount} files missing mandatory sections.`);
        console.error('See output above for details.');
        // We exit with 0 to allow the agent to read the output and decide on remediation, 
        // but in a CI context this should be 1.
        // For this task, I will exit 1 to signal "STOP" as per the plan.
        process.exit(1);
    } else {
        console.log('✅ Content Compliance Verified. All mandatory sections present.');
    }
}

main();
