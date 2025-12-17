const fs = require('fs');
const path = require('path');
// Simple recursive walk
function walkSync(dir, filelist = []) {
    if (!fs.existsSync(dir)) return filelist;
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            if (fs.statSync(dirFile).isDirectory()) {
                walkSync(dirFile, filelist);
            } else {
                filelist.push(dirFile);
            }
        } catch (e) { } // Ignore access errors
    });
    return filelist;
}

const SCHEMAS_DIR = path.resolve(__dirname, '../../schemas');
const PACKAGES_DIR = path.resolve(__dirname, '../../packages');
const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUT_DIR = path.resolve(__dirname, '../reports');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. Schema Index
const schemaIndex = [];
const schemaFiles = walkSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));
schemaFiles.forEach(f => {
    try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        schemaIndex.push({
            file: path.relative(SCHEMAS_DIR, f),
            id: content.$id,
            title: content.title,
            definitions: content.definitions ? Object.keys(content.definitions) : [],
            properties: content.properties ? Object.keys(content.properties) : []
        });
    } catch (e) { console.error('Error parsing schema', f); }
});

fs.writeFileSync(path.join(OUT_DIR, 'schema-symbol-index.json'), JSON.stringify(schemaIndex, null, 2));

// 2. Code Index (Simple Regex for Exports - not full AST for speed/no-deps)
const codeIndex = [];
const codeFiles = walkSync(PACKAGES_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts') && !f.includes('/test/'));
codeFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    // Simple regex to catch "export class X", "export interface Y", "export const Z"
    const exports = [];
    const regex = /export\s+(?:class|interface|type|const|function|enum)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        exports.push(match[1]);
    }
    if (exports.length > 0) {
        codeIndex.push({
            file: path.relative(PACKAGES_DIR, f),
            exports
        });
    }
});

fs.writeFileSync(path.join(OUT_DIR, 'code-symbol-index.json'), JSON.stringify(codeIndex, null, 2));

console.log('Semantic Indexes Built.');
