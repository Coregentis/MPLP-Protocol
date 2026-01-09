#!/usr/bin/env node
/**
 * MPLP Docs: Mermaid Build-Time SVG Renderer
 * 
 * Scans docs/ for ```mermaid blocks, generates light/dark SVGs,
 * and replaces blocks with <MermaidDiagram id="..." /> components.
 * 
 * Part of Day 2 P1-5 Performance Optimization
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DOCS_ROOT = path.join(ROOT, 'docs');
const DOCS_DIR = path.join(DOCS_ROOT, 'docs');
const STATIC_MERMAID_DIR = path.join(DOCS_ROOT, 'static/mermaid');

// Mermaid themes for light/dark
const MERMAID_CONFIG_LIGHT = {
    theme: 'default',
};

const MERMAID_CONFIG_DARK = {
    theme: 'dark',
    themeVariables: {
        primaryColor: '#2563EB',
        primaryTextColor: '#F9FAFB',
        primaryBorderColor: '#1F2937',
        signalColor: '#60A5FA',
        signalTextColor: '#F9FAFB',
        background: '#0B1120',
        mainBkg: '#111827',
        secondBkg: '#1F2937',
        lineColor: '#374151',
        border1: '#374151',
        border2: '#4B5563',
        arrowheadColor: '#9CA3AF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
    },
};

console.log('🎨 MPLP Mermaid Renderer - Build-Time SVG Generation');
console.log('========================================\\n');

// Extract concise caption for figure (different from alt - for SEO)
function extractCaption(code, content, startIndex, filePath) {
    // 1. Check for explicit title in mermaid frontmatter
    const titleMatch = code.match(/^---\s*\ntitle:\s*(.+?)\s*\n---/m);
    if (titleMatch) {
        return titleMatch[1].trim();
    }

    // 2. Look for preceding heading (use as-is, without MPLP prefix)
    const precedingText = content.substring(Math.max(0, startIndex - 500), startIndex);
    const headingMatch = precedingText.match(/#+\s+([^\n]+)\s*$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }

    // 3. Extract from first meaningful label in diagram
    const labelMatch = code.match(/[\[\(\{]([^\]\)\}\n]+)[\]\)\}]/);
    if (labelMatch && labelMatch[1].length < 60 && !labelMatch[1].match(/^[A-Z]$/)) {
        return labelMatch[1].trim();
    }

    // 4. No caption (optional field)
    return null;
}

// Ensure output directory exists
if (!fs.existsSync(STATIC_MERMAID_DIR)) {
    fs.mkdirSync(STATIC_MERMAID_DIR, { recursive: true });
    console.log(`✓ Created ${STATIC_MERMAID_DIR}`);
}

// Directories to skip during traversal
const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    '.docusaurus',
    'build',
    'static',
    'dist',
    '.next',
    '.cache',
]);

// Find all markdown/mdx files recursively
function findDocsFiles(dir) {
    const results = [];

    function walk(currentDir) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    // Skip excluded directories
                    if (SKIP_DIRS.has(entry.name)) continue;
                    // Skip mermaid output directory
                    if (entry.name === 'mermaid') continue;
                    // Recurse into subdirectories
                    walk(fullPath);
                } else if (entry.isFile()) {
                    // Only process .md and .mdx files
                    if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
                        results.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`Warning: Cannot read directory ${currentDir}: ${error.message}`);
        }
    }

    walk(dir);

    // Hard fail if no files found - prevents silent failures
    if (results.length === 0) {
        throw new Error(
            `Found 0 markdown files in ${dir}\n` +
            `This indicates a path resolution or traversal bug.\n` +
            `Check that DOCS_DIR points to the correct location.`
        );
    }

    return results;
}

// Extract meaningful alt text with MPLP protocol context for SEO/GEO
function extractAltText(code, content, startIndex, filePath) {
    // Extract context from file path
    const pathContext = extractPathContext(filePath);

    // 1. Check for title in mermaid syntax
    const titleMatch = code.match(/^---\s*\ntitle:\s*(.+?)\s*\n---/m) ||
        code.match(/%%.*title["']?:\s*["']?([^"',}]+)/i);
    if (titleMatch) {
        return `MPLP ${pathContext}: ${titleMatch[1].trim()}`;
    }

    // 2. Extract graph type and build MPLP-specific description
    const graphTypeMatch = code.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie)\s/i);
    if (graphTypeMatch) {
        const type = graphTypeMatch[1].toLowerCase();

        // Map generic types to MPLP-specific descriptions
        const typeMap = {
            'graph': 'architecture',
            'flowchart': 'flow',
            'sequencediagram': 'interaction sequence',
            'classdiagram': 'structure',
            'statediagram': 'state machine',
        };
        const mplpType = typeMap[type] || type;

        // Try to extract first meaningful node label
        const labelMatch = code.match(/[\[\(\{]([^\]\)\}\n]+)[\]\)\}]/);
        if (labelMatch && labelMatch[1].length < 50 && !labelMatch[1].match(/^[A-Z]$/)) {
            return `MPLP ${pathContext} ${mplpType}: ${labelMatch[1].trim()}`;
        }
        return `MPLP ${pathContext} ${mplpType} diagram`;
    }

    // 3. Look for preceding heading in markdown
    const precedingText = content.substring(Math.max(0, startIndex - 500), startIndex);
    const headingMatch = precedingText.match(/#+\s+([^\n]+)\s*$/m);
    if (headingMatch) {
        return `MPLP ${pathContext}: ${headingMatch[1].trim()}`;
    }

    // 4. Default with protocol branding and context
    return `MPLP ${pathContext} specification diagram`;
}

// Extract protocol context from file path for SEO/entity disambiguation
function extractPathContext(filePath) {
    const normalized = filePath.toLowerCase();

    // Layer context (L1-L4)
    if (normalized.includes('/l1-')) return 'L1 Core Protocol';
    if (normalized.includes('/l2-')) return 'L2 Coordination';
    if (normalized.includes('/l3-')) return 'L3 Observability';
    if (normalized.includes('/l4-')) return 'L4 Integration';

    // Module context
    if (normalized.includes('/plan-module')) return 'Plan Module';
    if (normalized.includes('/confirm-module')) return 'Confirmation Module';
    if (normalized.includes('/trace-module')) return 'Trace Module';
    if (normalized.includes('/context-module')) return 'Context Module';
    if (normalized.includes('/collab-module')) return 'Collaboration Module';
    if (normalized.includes('/dialog-module')) return 'Dialog Module';
    if (normalized.includes('/network-module')) return 'Network Module';
    if (normalized.includes('/extension-module')) return 'Extension Module';

    // Profile context
    if (normalized.includes('/sa-profile') || normalized.includes('/sa-events')) return 'Single-Agent Profile';
    if (normalized.includes('/map-profile') || normalized.includes('/map-events')) return 'Multi-Agent Profile';
    if (normalized.includes('/multi-agent-governance')) return 'Multi-Agent Governance';

    // Architecture context
    if (normalized.includes('/architecture')) return 'Protocol Architecture';
    if (normalized.includes('/kernel-duties')) return 'Kernel Duties';

    // Observability context
    if (normalized.includes('/observability')) return 'Observability Layer';
    if (normalized.includes('/event-taxonomy')) return 'Event Taxonomy';

    // Governance context
    if (normalized.includes('/governance')) return 'Protocol Governance';

    // Guides/Examples
    if (normalized.includes('/guides') || normalized.includes('/examples')) return 'Implementation Guide';
    if (normalized.includes('/golden-flows')) return 'Golden Flow';

    // Default
    return 'Protocol v1.0';
}

// Extract mermaid blocks from content
function extractMermaidBlocks(content) {
    const blocks = [];
    const regex = /```mermaid\n([\s\S]*?)\n```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        blocks.push({
            fullMatch: match[0],
            code: match[1].trim(),
            startIndex: match.index,
        });
    }

    return blocks;
}

// Generate SHA256 hash for diagram content
function generateDiagramId(code) {
    return crypto.createHash('sha256').update(code).digest('hex').substring(0, 16);
}

// Render Mermaid to SVG using mmdc CLI
function renderMermaidToSVG(code, theme, outputPath) {
    const tempInputFile = path.join(STATIC_MERMAID_DIR, `temp-${Date.now()}.mmd`);
    const configFile = path.join(STATIC_MERMAID_DIR, `temp-config-${Date.now()}.json`);

    try {
        // Write temp diagram file
        fs.writeFileSync(tempInputFile, code);

        // Write temp config file
        const config = theme === 'light' ? MERMAID_CONFIG_LIGHT : MERMAID_CONFIG_DARK;
        fs.writeFileSync(configFile, JSON.stringify(config));

        // Run mmdc (may need puppeteer-config for CI)
        const command = `npx -y @mermaid-js/mermaid-cli@latest -i "${tempInputFile}" -o "${outputPath}" -c "${configFile}" -b transparent`;

        execSync(command, { stdio: 'pipe' });

        // Cleanup temp files
        fs.unlinkSync(tempInputFile);
        fs.unlinkSync(configFile);

        return true;
    } catch (error) {
        console.error(`   ✗ Failed to render: ${error.message}`);
        // Cleanup on error
        if (fs.existsSync(tempInputFile)) fs.unlinkSync(tempInputFile);
        if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
        return false;
    }
}

// Process a single file
function processFile(filePath) {
    const relativePath = path.relative(ROOT, filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    const blocks = extractMermaidBlocks(content);

    if (blocks.length === 0) {
        return { processed: false };
    }

    console.log(`\\n📄 ${relativePath}`);
    console.log(`   Found ${blocks.length} Mermaid diagram(s)`);

    let modified = false;
    const replacements = [];

    for (const block of blocks) {
        const diagramId = generateDiagramId(block.code);
        const lightPath = path.join(STATIC_MERMAID_DIR, `${diagramId}.light.svg`);
        const darkPath = path.join(STATIC_MERMAID_DIR, `${diagramId}.dark.svg`);

        // Check if SVGs already exist
        if (fs.existsSync(lightPath) && fs.existsSync(darkPath)) {
            console.log(`   ✓ Cached: ${diagramId}`);
        } else {
            console.log(`   🎨 Rendering: ${diagramId}`);

            // Render light theme
            if (renderMermaidToSVG(block.code, 'light', lightPath)) {
                console.log(`      → light.svg`);
            }

            // Render dark theme
            if (renderMermaidToSVG(block.code, 'dark', darkPath)) {
                console.log(`      → dark.svg`);
            }
        }

        // Extract meaningful alt text with protocol context
        const altText = extractAltText(block.code, content, block.startIndex, filePath);

        // Extract caption (optional, for figcaption)
        const caption = extractCaption(block.code, content, block.startIndex, filePath);

        // Preserve source for machine readability (escaped for JSX)
        const source = block.code.replace(/`/g, '\\`').replace(/\$/g, '\\$');

        // Prepare replacement with all semantic layers
        const replacement = caption
            ? `<MermaidDiagram id="${diagramId}" alt="${altText}" caption="${caption}" source={\`${source}\`} />`
            : `<MermaidDiagram id="${diagramId}" alt="${altText}" source={\`${source}\`} />`;
        replacements.push({
            original: block.fullMatch,
            replacement,
        });

        modified = true;
    }

    // Apply replacements
    if (modified) {
        for (const { original, replacement } of replacements) {
            content = content.replace(original, replacement);
        }

        fs.writeFileSync(filePath, content);
        console.log(`   ✓ Updated file with ${replacements.length} component(s)`);
    }

    return { processed: true, count: blocks.length };
}

// Main execution
function main() {
    const files = findDocsFiles(DOCS_DIR);
    console.log(`Found ${files.length} documentation files\\n`);

    let totalDiagrams = 0;
    let filesProcessed = 0;

    for (const file of files) {
        const result = processFile(file);
        if (result.processed) {
            filesProcessed++;
            totalDiagrams += result.count;
        }
    }

    console.log('\\n========================================');
    console.log(`✨ Complete!`);
    console.log(`   Files processed: ${filesProcessed}`);
    console.log(`   Diagrams rendered: ${totalDiagrams}`);
    console.log(`   Output: docs/static/mermaid/`);
    console.log('========================================\\n');
}

main();
