const fs = require('fs');
const path = require('path');

const CLI_FILE = path.join(__dirname, '../packages/devtools/src/cli.ts');

const TS_HEADER = `/**
 * MPLP Protocol v1.0.0 — Frozen Specification
 * Freeze Date: 2025-12-03
 * Status: FROZEN (no breaking changes permitted)
 * Governance: MPLP Protocol Governance Committee (MPGC)
 *
 * © 2025 邦士（北京）网络科技有限公司. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 */`;

const SHEBANG = "#!/usr/bin/env node";

function fixCli() {
    if (!fs.existsSync(CLI_FILE)) {
        console.error("CLI file not found:", CLI_FILE);
        return;
    }

    let content = fs.readFileSync(CLI_FILE, 'utf8');

    // Find the start of the actual code (first import)
    const importIndex = content.indexOf('import { Command }');
    if (importIndex === -1) {
        console.error("Could not find start of code in cli.ts");
        return;
    }

    // Keep only the code part
    const codeContent = content.substring(importIndex);

    // Reconstruct
    const finalContent = `${SHEBANG}\n${TS_HEADER}\n\n${codeContent}`;

    fs.writeFileSync(CLI_FILE, finalContent, 'utf8');
    console.log("Fixed cli.ts header and shebang (aggressive clean).");
}

fixCli();
