#!/usr/bin/env node

/**
 * Docs Description Report
 * Groups pages missing description by directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../../docs/docs');

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const yaml = match[1];
    const result = {};

    yaml.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            result[key] = value;
        }
    });

    return result;
}

let byDirectory = {};

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DOCS_DIR, filePath);
    const fm = parseFrontmatter(content);

    if (!fm.description) {
        const dir = path.dirname(relativePath);
        const topDir = dir.split('/')[0] || 'root';

        if (!byDirectory[topDir]) byDirectory[topDir] = [];
        byDirectory[topDir].push({
            file: relativePath,
            title: fm.title || path.basename(relativePath, path.extname(relativePath)),
            hasAuthority: !!fm.authority && fm.authority !== 'none'
        });
    }
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            auditFile(fullPath);
        }
    }
}

console.log('=== Pages Missing Description (Grouped by Directory) ===\n');

scanDirectory(DOCS_DIR);

let total = 0;
Object.keys(byDirectory).sort().forEach(dir => {
    const files = byDirectory[dir];
    total += files.length;
    console.log(`\n## ${dir}/ (${files.length} files)\n`);
    files.forEach(f => {
        const authBadge = f.hasAuthority ? '' : ' [no-authority]';
        console.log(`- ${f.file}${authBadge}`);
    });
});

console.log(`\n\n=== TOTAL: ${total} pages missing description ===`);
