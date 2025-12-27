import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const CLASSIFICATION_PATH = path.join(ROOT, 'docs-classification.json');

// ---- 1. Grammar Definitions (Regex) ----
const GRAMMAR = {
    normativeRoot: new RegExp(
        [
            "^> \\*\\*Status\\*\\*: Normative$",
            "^> \\*\\*Version\\*\\*: \\d+\\.\\d+\\.\\d+$",
            "^> \\*\\*Authority\\*\\*: MPGC$",
            "^> \\*\\*Protocol\\*\\*: MPLP v1\\.0\\.0 \\(Frozen\\)$",
        ].join("\\n"),
        "m"
    ),

    normativeInherited: new RegExp(
        [
            "^> \\*\\*Status\\*\\*: Normative$",
            "^> \\*\\*Version\\*\\*: \\d+\\.\\d+\\.\\d+$",
            "^> \\*\\*Authority\\*\\*: MPGC$",
            "^> \\*\\*Scope\\*\\*: Inherited \\(from: (.+)\\)$",
            "^> \\*\\*Non-Goals\\*\\*: Inherited \\(from: (.+)\\)$",
        ].join("\\n"),
        "m"
    ),

    informative: new RegExp(
        [
            "^> \\*\\*Status\\*\\*: Informative$",
            "^> \\*\\*Version\\*\\*: \\d+\\.\\d+\\.\\d+$",
            "^> \\*\\*Authority\\*\\*: Documentation Governance$",
        ].join("\\n"),
        "m"
    ),

    governance: new RegExp(
        [
            "^\\*\\*ID\\*\\*: DGP-[A-Z0-9-]+$",
            "^\\*\\*Version\\*\\*: \\d+\\.\\d+$",
            "^\\*\\*Status\\*\\*: FROZEN$",
            "^\\*\\*Authority\\*\\*: Documentation Governance$",
            "^\\*\\*Last Updated\\*\\*: \\d{4}-\\d{2}-\\d{2}$",
        ].join("\\n"),
        "m"
    ),

    forbiddenAlerts: /\[!(IMPORTANT|NOTE|FROZEN|WARNING)\]/,
};

// ---- 2. Parser ----
function parseHeader(md) {
    const lines = md.split("\n");

    // Skip Frontmatter
    let startLine = 0;
    if (lines[0].trim() === '---') {
        let endFm = -1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                endFm = i;
                break;
            }
        }
        if (endFm !== -1) {
            startLine = endFm + 1;
        }
    }

    // Find H1
    let h1Found = false;
    let headerBlockStart = -1;

    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('# ')) {
            h1Found = true;
            continue;
        }

        if (h1Found) {
            // The first non-empty block after H1 should be the header
            if (line.startsWith('>') || line.startsWith('**ID**:')) {
                headerBlockStart = i;
                break;
            } else {
                // Found something else before header?
                // DGP-08 says "Immediately following the H1"
                // We allow empty lines.
                // If we find text that is not header, then header is missing.
                break;
            }
        }
    }

    if (!h1Found) throw new Error("Missing H1 title");
    if (headerBlockStart === -1) throw new Error("Missing governance header block after H1");

    // Extract Header Block
    const headerLines = [];
    for (let i = headerBlockStart; i < lines.length; i++) {
        const l = lines[i].trim();
        if (!l) break; // End of block
        if (l.startsWith('>') || l.startsWith('**')) {
            headerLines.push(l);
        } else {
            break;
        }
    }

    const headerText = headerLines.join("\n");

    if (GRAMMAR.forbiddenAlerts.test(md)) {
        throw new Error("Forbidden Markdown alert syntax detected");
    }

    if (GRAMMAR.normativeRoot.test(headerText)) {
        return { type: 'normative-root', raw: headerText };
    }

    const inherited = headerText.match(GRAMMAR.normativeInherited);
    if (inherited) {
        return {
            type: 'normative-inherited',
            scopeInheritedFrom: inherited[1],
            nonGoalsInheritedFrom: inherited[2],
            raw: headerText
        };
    }

    if (GRAMMAR.informative.test(headerText)) {
        return { type: 'informative', raw: headerText };
    }

    if (GRAMMAR.governance.test(headerText)) {
        return { type: 'governance', raw: headerText };
    }

    throw new Error("Header does not match any approved grammar");
}

// ---- 3. Rule Engine ----
function enforceRules(ast, item, md) {
    // Normative Rules
    if (item.doc_type === 'normative') {
        if (ast.type === 'normative-inherited') {
            if (ast.scopeInheritedFrom !== ast.nonGoalsInheritedFrom) {
                throw new Error("Inheritance source must be consistent for Scope and Non-Goals");
            }
            // Verify source exists (optional, but good)
            // const sourcePath = path.join(ROOT, ast.scopeInheritedFrom);
            // if (!fs.existsSync(sourcePath)) throw new Error(`Inherited source not found: ${ast.scopeInheritedFrom}`);

            if (/^##\s+Scope/m.test(md) || /^##\s+Non-Goals/m.test(md)) {
                throw new Error("Normative inherited doc must NOT redefine Scope / Non-Goals");
            }
        } else if (ast.type === 'normative-root') {
            if (!/^##\s+Scope/m.test(md)) throw new Error("Normative root missing Scope section");
            if (!/^##\s+Non-Goals/m.test(md)) throw new Error("Normative root missing Non-Goals section");
        } else {
            throw new Error(`Normative doc has invalid header type: ${ast.type}`);
        }
    }

    // Governance Rules
    if (item.doc_type === 'governance') {
        if (ast.type !== 'governance') throw new Error("Governance doc must have Governance Header");
        if (md.includes('> **Status**:')) throw new Error("Governance docs MUST NOT use blockquote headers");
    }

    // Standards Mapping Rules
    if (item.tags && item.tags.includes('standards-mapping')) {
        if (!/^##\s+Interpretation Notice/m.test(md)) throw new Error("Standards mapping missing Interpretation Notice");
        if (!/^##\s+Non-Claims/m.test(md)) throw new Error("Standards mapping missing Non-Claims");
    }
}

// ---- 4. Main ----
function main() {
    console.log('Starting strict documentation validation...');
    const classification = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
    let failureCount = 0;

    classification.items.forEach(item => {
        if (item.doc_type === 'internal_ops' || item.doc_type === 'unknown') return;

        const fullPath = path.join(ROOT, item.path);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${item.path}`);
            failureCount++;
            return;
        }

        const md = fs.readFileSync(fullPath, 'utf8');
        try {
            const ast = parseHeader(md);
            enforceRules(ast, item, md);
            // console.log(`✔ ${item.path}`);
        } catch (e) {
            console.error(`❌ ${item.path}: ${e.message}`);
            failureCount++;
        }
    });

    if (failureCount > 0) {
        console.error(`\n❌ Validation FAILED: ${failureCount} errors.`);
        process.exit(1);
    } else {
        console.log('\n✅ Validation PASSED: All docs compliant.');
    }
}

main();
