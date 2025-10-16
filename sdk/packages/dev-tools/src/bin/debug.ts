#!/usr/bin/env node

/**
 * @fileoverview MPLP Debug CLI - Command line interface for debugging
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { CLIRunner } from '../cli/CLIRunner';

async function main() {
  try {
    const cli = new CLIRunner();
    await cli.run(['node', 'mplp-debug', 'debug', ...process.argv.slice(2)]);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
