#!/usr/bin/env node

/**
 * @fileoverview MPLP Monitor CLI - Command line interface for monitoring
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { CLIRunner } from '../cli/CLIRunner';

async function main() {
  try {
    const cli = new CLIRunner();
    await cli.run(['node', 'mplp-monitor', 'monitor', ...process.argv.slice(2)]);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main();
