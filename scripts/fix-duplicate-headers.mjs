import fs from 'fs';
import path from 'path';

const FROZEN_BLOCK = `> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.`;

const COPYRIGHT_FOOTER = `
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.`;

function fixDuplicateHeaders(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            fixDuplicateHeaders(fullPath);
        } else if (file.name.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Check if this is a normative doc (docs/00-07)
            const isNormative = /docs[\\/]0[0-7]-/.test(fullPath);
            if (!isNormative) continue;

            // Count FROZEN blocks
            const frozenRegex = /> \[!FROZEN\][\s\S]*?> \*\*Note\*\*:.*?new protocol version\./g;
            const matches = content.match(frozenRegex);

            if (matches && matches.length > 1) {
                console.log('Fixing duplicate headers in:', fullPath);

                // Remove ALL frozen blocks
                content = content.replace(frozenRegex, '');

                // Remove ALL copyright footers
                content = content.replace(/[\r\n]+---[\r\n]+© 2025 邦士[\s\S]*?Version 2\.0\.[\r\n]*/g, '');

                // Clean up extra newlines at start
                content = content.replace(/^[\r\n]+/, '');

                // Add single frozen block at start
                content = FROZEN_BLOCK + '\n\n' + content.trim();

                // Add single footer at end
                content = content + COPYRIGHT_FOOTER + '\n';

                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('  Fixed!');
            }
        }
    }
}

console.log('Starting duplicate header fix...');
fixDuplicateHeaders('./docs');
console.log('Done!');
