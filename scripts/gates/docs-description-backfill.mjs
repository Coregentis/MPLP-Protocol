#!/usr/bin/env node

/**
 * Docs Description Backfill
 * Adds default descriptions based on directory and title
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

// Directory-based description templates
const TEMPLATES = {
    'specification/architecture': (title) => `MPLP architecture documentation: ${title}. Defines structural requirements and layer responsibilities.`,
    'specification/modules': (title) => `MPLP module specification: ${title}. Defines schema requirements and invariants.`,
    'specification/observability': (title) => `MPLP observability specification: ${title}. Defines event schemas and trace formats.`,
    'specification/profiles': (title) => `MPLP profile specification: ${title}. Defines conformance requirements for execution profiles.`,
    'specification/integration': (title) => `MPLP integration specification: ${title}. Defines external system integration requirements.`,
    'specification': (title) => `MPLP specification: ${title}. Normative protocol requirements.`,

    'evaluation/conformance': (title) => `MPLP conformance evaluation: ${title}. Non-normative guidance for protocol conformance assessment.`,
    'evaluation/golden-flows': (title) => `MPLP evaluation scenario: ${title}. Reference flow for conformance testing.`,
    'evaluation/governance': (title) => `MPLP governance documentation: ${title}. Governance processes and policies.`,
    'evaluation/standards': (title) => `MPLP standards mapping: ${title}. Relationship to external standards.`,
    'evaluation/tests': (title) => `MPLP test documentation: ${title}. Test suite structure and fixtures.`,
    'evaluation': (title) => `MPLP evaluation: ${title}. Non-normative assessment guidance.`,

    'guides/runtime': (title) => `MPLP runtime guide: ${title}. Implementation guidance for runtime components.`,
    'guides': (title) => `MPLP implementation guide: ${title}. Non-normative reference patterns.`,

    'governance': (title) => `MPLP governance: ${title}. Protocol governance documentation.`,
    'meta': (title) => `MPLP meta documentation: ${title}. Release and maintenance information.`,
    'root': (title) => `MPLP documentation: ${title}. Introduction and overview.`
};

function getTemplate(relativePath) {
    // Try longest prefix match
    const prefixes = Object.keys(TEMPLATES).sort((a, b) => b.length - a.length);
    const dir = path.dirname(relativePath);

    for (const prefix of prefixes) {
        if (dir.startsWith(prefix) || dir === prefix) {
            return TEMPLATES[prefix];
        }
    }

    return TEMPLATES['root'];
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { fm: {}, body: content, hasYaml: false };

    const yaml = match[1];
    const body = content.slice(match[0].length);
    const fm = {};

    yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            fm[key] = value;
        }
    });

    return { fm, body, hasYaml: true, rawYaml: yaml };
}

let fixed = 0;
let skipped = 0;

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DOCS_DIR, filePath);
    const { fm, hasYaml, rawYaml, body } = parseFrontmatter(content);

    if (fm.description) {
        skipped++;
        return;
    }

    const title = fm.title || path.basename(relativePath, path.extname(relativePath))
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    const template = getTemplate(relativePath);
    const description = template(title);

    // Add description to frontmatter
    const newYaml = `${rawYaml}\ndescription: "${description}"`;
    const newContent = `---\n${newYaml}\n---${body}`;

    fs.writeFileSync(filePath, newContent);
    console.log(`✓ ${relativePath}`);
    fixed++;
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            processFile(fullPath);
        }
    }
}

console.log('=== Docs Description Backfill ===\n');

scanDirectory(DOCS_DIR);

console.log(`\nFixed: ${fixed}`);
console.log(`Skipped (already has description): ${skipped}`);
