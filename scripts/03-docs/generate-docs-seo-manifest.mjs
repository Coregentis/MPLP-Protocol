#!/usr/bin/env node

/**
 * Docs SEO Manifest Generator
 * Generates machine-readable manifest with tripod links for Entity Alignment
 * Input: Phase 0 inventory (or same extraction logic)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_ROOT = path.resolve(__dirname, '../../docs/docs');
const INVENTORY_PATH = path.resolve(__dirname, '../../docs-governance/audits/DOCS_IDENTITY_INVENTORY.v1.json');
const ENTITY_PATH = path.resolve(__dirname, '../../governance/entity/entity.json');
const OUTPUT_AUDIT = path.resolve(__dirname, '../../docs-governance/outputs');
const OUTPUT_STATIC = path.resolve(__dirname, '../../docs/static/meta');

// Ensure output directories exist
[OUTPUT_AUDIT, OUTPUT_STATIC].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Load entity definition
const entity = JSON.parse(fs.readFileSync(ENTITY_PATH, 'utf8'));

// Load inventory
const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

// Calculate doc_profile
function calculateDocProfile(normativity, lifecycle_status, authority) {
    if (!normativity) return 'unknown-default-informative';

    if (normativity === 'normative') {
        if (lifecycle_status === 'frozen') return 'normative-frozen';
        if (lifecycle_status === 'active') return 'normative-active';
        return 'normative-draft';
    }

    if (normativity === 'formative') {
        return 'formative';
    }

    if (normativity === 'informative' || normativity === 'non-normative') {
        return 'informative';
    }

    return 'unknown-default-informative';
}

// Calculate robots directive
function calculateRobots(doc_profile, lifecycle_status, normativity) {
    // Formative pages should be noindex
    if (doc_profile === 'formative' || normativity === 'formative' || lifecycle_status === 'formative') {
        return 'noindex,follow';
    }

    return 'index,follow';
}

// Generate manifest
function generateManifest() {
    const pages = [];
    const missingDescription = [];

    inventory.forEach(page => {
        const doc_profile = calculateDocProfile(
            page.normativity || page.doc_type,
            page.lifecycle_status || page.status,
            page.authority
        );

        const robots = calculateRobots(
            doc_profile,
            page.lifecycle_status || page.status,
            page.normativity || page.doc_type
        );

        // Build canonical URL
        const canonical = `https://docs.mplp.io/docs/${page.path.replace(/\.(md|mdx)$/, '')}`;

        // Track missing description
        if (!page.description) {
            missingDescription.push(page.path);
        }

        pages.push({
            path: `/docs/${page.path.replace(/\.(md|mdx)$/, '')}`,
            title: page.title || null, // Will be enhanced in future
            description: page.description || null,
            canonical,
            robots,
            doc_profile,
            normativity: page.normativity || page.doc_type || null,
            lifecycle_status: page.lifecycle_status || page.status || null,
            authority: page.authority || null,
            missing_fields: page.missing_fields || [],
        });
    });

    const manifest = {
        generated_at: new Date().toISOString(),
        source_commit: process.env.GIT_COMMIT || 'local',
        protocol_version: entity.protocol_version,
        schema_bundle_version: entity.schema_bundle_version,
        tripod: {
            website_anchor: 'https://www.mplp.io/what-is-mplp',
            docs_anchor: 'https://docs.mplp.io/docs/reference/entrypoints',
            repo_anchor: 'https://github.com/Coregentis/MPLP-Protocol',
        },
        total_pages: pages.length,
        pages,
    };

    return { manifest, missingDescription };
}

// Main execution
console.log('Generating Docs SEO Manifest...');

const { manifest, missingDescription } = generateManifest();

// Write to audit location
const auditPath = path.join(OUTPUT_AUDIT, 'docs-seo-manifest.json');
fs.writeFileSync(auditPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Generated: ${auditPath}`);

// Write to static location (for web crawlers)
const staticPath = path.join(OUTPUT_STATIC, 'docs-seo-manifest.json');
fs.writeFileSync(staticPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Generated: ${staticPath}`);

// Write missing description list
if (missingDescription.length > 0) {
    const missingPath = path.join(OUTPUT_AUDIT, 'missing-description.pages.txt');
    fs.writeFileSync(missingPath, missingDescription.join('\n'));
    console.log(`⚠ Missing description: ${missingDescription.length} pages`);
    console.log(`  List saved to: ${missingPath}`);
}

console.log('\nManifest Generation Complete!');
console.log(`Total pages: ${manifest.total_pages}`);
console.log(`Tripod links: ✓`);
console.log(`Missing description: ${missingDescription.length}`);
