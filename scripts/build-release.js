/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG_FILE = 'release-config.yaml';
const DIST_DIR = 'dist/mplp-v1.0';

function loadConfig() {
    const configPath = path.resolve(process.cwd(), CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }
    const fileContents = fs.readFileSync(configPath, 'utf8');
    return yaml.load(fileContents);
}

function cleanDist() {
    const distPath = path.resolve(process.cwd(), DIST_DIR);
    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true, force: true });
        console.log(`Cleaned ${DIST_DIR}`);
    }
    fs.mkdirSync(distPath, { recursive: true });
}

function isExcluded(filePath, excludePatterns) {
    // Simple glob-like matching for **
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    for (const pattern of excludePatterns) {
        const regexPattern = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\//g, '\\/');
        const regex = new RegExp(`^${regexPattern}`);
        if (regex.test(relativePath)) {
            return true;
        }
    }
    return false;
}

function copyRecursive(src, dest, config) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);

            if (isExcluded(srcPath, config.exclude)) {
                continue;
            }

            copyRecursive(srcPath, destPath, config);
        }
    } else {
        if (!isExcluded(src, config.exclude)) {
            // Ensure parent directory exists
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }
            fs.copyFileSync(src, dest);
        }
    }
}

function processIncludes(config) {
    const rootDir = process.cwd();
    const distPath = path.resolve(rootDir, DIST_DIR);

    for (const pattern of config.include) {
        // Handle simple globs manually since we don't want to add glob dependency if not needed
        // Assuming patterns are either direct files/dirs or end with /**

        let srcPath = pattern;

        if (pattern.endsWith('/**')) {
            srcPath = pattern.substring(0, pattern.length - 3);
        } else if (pattern.endsWith('/*')) {
            srcPath = pattern.substring(0, pattern.length - 2);
        }

        const absSrcPath = path.resolve(rootDir, srcPath);

        if (!fs.existsSync(absSrcPath)) {
            console.warn(`Warning: Source path not found: ${srcPath}`);
            continue;
        }

        const destPath = path.join(distPath, srcPath);

        console.log(`Copying ${srcPath}...`);
        copyRecursive(absSrcPath, destPath, config);
    }
}

function createReadme() {
    const readmeContent = `# MPLP Protocol v1.0 Frozen Specification

This is the official frozen specification for MPLP v1.0.0.

## Contents

- **docs/**: The complete protocol specification.
- **schemas/v2/**: JSON Schema definitions.
- **tests/golden/**: Compliance test fixtures.
- **packages/**: Reference runtime and protocol packages.

**Note**: Internal archives and governance documents are excluded from this release.
`;
    fs.writeFileSync(path.join(DIST_DIR, 'README-RELEASE.md'), readmeContent);
}

function main() {
    try {
        console.log('Starting MPLP v1.0 Release Build...');
        const config = loadConfig();

        cleanDist();
        processIncludes(config);
        createReadme();

        console.log('Release build completed successfully!');
        console.log(`Output directory: ${DIST_DIR}`);

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

main();
