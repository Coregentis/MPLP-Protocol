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

const SOURCE_DIR = path.join(__dirname, '../schemas/v2');
const TARGET_DIR = path.join(__dirname, '../packages/schema/schemas');

function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src, { withFileTypes: true });

    for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else if (item.isFile() && item.name.endsWith('.json')) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${item.name}`);
        }
    }
}

console.log(`Copying schemas from ${SOURCE_DIR} to ${TARGET_DIR}...`);
if (fs.existsSync(SOURCE_DIR)) {
    // Clean target first? Maybe not needed if we overwrite.
    copyRecursive(SOURCE_DIR, TARGET_DIR);
    console.log("Schema copy complete.");
} else {
    console.error("Source schema directory not found:", SOURCE_DIR);
    process.exit(1);
}
