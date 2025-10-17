#!/usr/bin/env node
"use strict";
/**
 * @fileoverview MPLP Debug CLI - Command line interface for debugging
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
const CLIRunner_1 = require("../cli/CLIRunner");
async function main() {
    try {
        const cli = new CLIRunner_1.CLIRunner();
        await cli.run(['node', 'mplp-debug', 'debug', ...process.argv.slice(2)]);
    }
    catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=debug.js.map