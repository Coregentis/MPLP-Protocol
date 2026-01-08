import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../');
const DOCS_ROOT = path.join(ROOT, 'docs/docs');

function fixArchitectureOverview() {
    const p = path.join(DOCS_ROOT, '01-architecture/architecture-overview.md');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    if (content.includes('## Scope')) return;

    // Insert after header block
    const lines = content.split('\n');
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('> **Protocol**:')) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx === -1) {
        // Fallback: look for last blockquote
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('>')) insertIdx = i + 1;
        }
    }

    if (insertIdx !== -1) {
        const newSections = `\n\n## Scope\n\nThis document defines the high-level architecture and normative structure of the Multi-Agent Lifecycle Protocol (MPLP).\n\n## Non-Goals\n\nSpecific implementation details, language bindings, and non-normative examples are out of scope for this overview.`;
        const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
        fs.writeFileSync(p, newContent);
        console.log('Fixed architecture-overview.md');
    }
}

function fixRuntimeGlue() {
    const p = path.join(DOCS_ROOT, '14-runtime/runtime-glue-overview.md');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Rename "4. In-Scope vs Out-of-Scope" to "Scope" and "Non-Goals"
    // The file has:
    // ## 4. In-Scope vs Out-of-Scope
    // ### 4.1 In-Scope ...
    // ### 4.2 Out-of-Scope ...

    if (content.includes('## Scope')) return;

    content = content.replace(/## 4\. In-Scope vs Out-of-Scope\s*\n\s*### 4\.1 In-Scope \(Phase 5 Runtime Glue\)/, '## Scope');
    content = content.replace(/### 4\.2 Out-of-Scope \(Phase 5\)/, '## Non-Goals');

    // Clean up numbered lists if needed, but the content is what matters.
    // The replacement above might leave some text hanging.
    // Let's be more precise.

    // Replace the whole section header block
    // Actually, simply replacing the headers is enough to pass validation.
    // But we want it to look good.

    // Regex for the block
    // We'll just append standard Scope/Non-Goals at the top if we can't easily refactor the existing text without semantic risk.
    // But the existing text IS the scope.
    // Let's try to just insert standard Scope/Non-Goals at the top, and leave Section 4 as "Detailed Scope".
    // This is safer and compliant.

    const lines = content.split('\n');
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('> **Protocol**:')) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx !== -1) {
        const newSections = `\n\n## Scope\n\nThis document defines the specification layer for MPLP Runtime Glue (L3), including PSG interactions and event emissions.\n\n## Non-Goals\n\nThis document does not mandate specific implementation languages, storage engines, or internal architecture of the runtime beyond the specified interfaces.`;
        const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
        fs.writeFileSync(p, newContent);
        console.log('Fixed runtime-glue-overview.md');
    }
}

function fixIntegrationSpec() {
    const p = path.join(DOCS_ROOT, '07-integration/integration-spec.md');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    if (content.includes('## Scope') && !content.includes('## 1. Scope')) return; // Avoid matching the code block example

    const lines = content.split('\n');
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('> **Protocol**:')) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx !== -1) {
        const newSections = `\n\n## Scope\n\nThis specification defines the optional Integration Layer (L4) of MPLP, including event schemas for external tools.\n\n## Non-Goals\n\nThis specification does not mandate the use of any specific external tool or CI/CD platform.`;
        const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
        fs.writeFileSync(p, newContent);
        console.log('Fixed integration-spec.md');
    }
}

function fixProfiles() {
    const profiles = ['03-profiles/sa-profile.md', '03-profiles/map-profile.md', '03-profiles/multi-agent-governance-profile.md'];

    profiles.forEach(relPath => {
        const p = path.join(DOCS_ROOT, relPath);
        if (!fs.existsSync(p)) return;
        let content = fs.readFileSync(p, 'utf8');

        if (content.includes('## Scope')) return;

        const lines = content.split('\n');
        let insertIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('> **Protocol**:')) {
                insertIdx = i + 1;
                break;
            }
        }

        if (insertIdx !== -1) {
            const newSections = `\n\n## Scope\n\nThis profile defines normative requirements for specific agent configurations.\n\n## Non-Goals\n\nThis profile does not mandate implementation details beyond the specified invariants.`;
            const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
            fs.writeFileSync(p, newContent);
            console.log(`Fixed ${relPath}`);
        }
    });
}

function fixObservability() {
    const p = path.join(DOCS_ROOT, '04-observability/observability-overview.md');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('## Scope')) return;

    const lines = content.split('\n');
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('> **Protocol**:')) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx !== -1) {
        const newSections = `\n\n## Scope\n\nThis document defines the normative requirements for MPLP Observability (L3), including event taxonomy and schema invariants.\n\n## Non-Goals\n\nSpecific monitoring tools or dashboard implementations are out of scope.`;
        const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
        fs.writeFileSync(p, newContent);
        console.log('Fixed observability-overview.md');
    }
}

function fixGoldenFlows() {
    const p = path.join(DOCS_ROOT, '06-golden-flows/index.mdx');
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('## Scope')) return;

    const lines = content.split('\n');
    let insertIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('> **Protocol**:')) {
            insertIdx = i + 1;
            break;
        }
    }

    if (insertIdx !== -1) {
        const newSections = `\n\n## Scope\n\nThis document defines the normative Golden Flows that all MPLP-compliant runtimes must support.\n\n## Non-Goals\n\nAlternative or experimental flows not listed here are not required for compliance.`;
        const newContent = lines.slice(0, insertIdx).join('\n') + newSections + '\n' + lines.slice(insertIdx).join('\n');
        fs.writeFileSync(p, newContent);
        console.log('Fixed golden-flows/index.mdx');
    }
}

function main() {
    console.log('Fixing normative roots...');
    fixArchitectureOverview();
    fixRuntimeGlue();
    fixIntegrationSpec();
    fixProfiles();
    fixObservability();
    fixGoldenFlows();
    console.log('Root fix complete.');
}

main();
