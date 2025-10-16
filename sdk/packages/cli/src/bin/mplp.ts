#!/usr/bin/env node

/**
 * @fileoverview MPLP CLI executable
 */

import { CLIApplication } from '../core/CLIApplication';
import { CLIConfig, CLIContext } from '../core/types';
import { InitCommand } from '../commands/InitCommand';
import { GenerateCommand } from '../commands/GenerateCommand';
import { DevCommand } from '../commands/DevCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { InfoCommand } from '../commands/InfoCommand';
import { BuildCommand } from '../commands/BuildCommand';
import { TestCommand } from '../commands/TestCommand';
import { LintCommand } from '../commands/LintCommand';
import { CleanCommand } from '../commands/CleanCommand';
import { Logger } from '../core/Logger';
import { Spinner } from '../core/Spinner';

/**
 * Create CLI configuration
 */
function createCLIConfig(): CLIConfig {
  // Get package.json for version info
  const packageJson = require('../../package.json');

  return {
    name: 'mplp',
    version: packageJson.version,
    description: 'Command-line interface for MPLP (Multi-Agent Protocol Lifecycle Platform)',
    commands: [],
    globalOptions: [
      {
        flags: '--verbose',
        description: 'Enable verbose output'
      },
      {
        flags: '--quiet',
        description: 'Suppress output'
      },
      {
        flags: '--debug',
        description: 'Enable debug mode'
      }
    ]
  };
}

/**
 * Create CLI context
 */
function createCLIContext(config: CLIConfig): CLIContext {
  return {
    cwd: process.cwd(),
    config,
    logger: new Logger(),
    spinner: new Spinner()
  };
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  try {
    // Handle global options
    if (process.argv.includes('--debug')) {
      process.env.DEBUG = 'true';
    }

    if (process.argv.includes('--verbose')) {
      process.env.VERBOSE = 'true';
    }

    if (process.argv.includes('--quiet')) {
      process.env.QUIET = 'true';
    }

    // Create CLI configuration
    const config = createCLIConfig();
    const context = createCLIContext(config);

    // Create commands
    const commands = [
      new InitCommand(context),
      new GenerateCommand(context),
      new DevCommand(context),
      new BuildCommand(context),
      new TestCommand(context),
      new LintCommand(context),
      new CleanCommand(context),
      new HelpCommand(context),
      new InfoCommand(context)
    ];

    // Add commands to config
    config.commands = commands;

    // Create and run CLI application
    const app = new CLIApplication(config);
    await app.run();

  } catch (error) {
    const logger = new Logger();
    
    if (error instanceof Error) {
      logger.error(error.message);
      
      if (process.env.DEBUG) {
        logger.debug(error.stack || 'No stack trace available');
      }
    } else {
      logger.error('An unexpected error occurred');
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger();
  logger.error('Unhandled promise rejection:', reason);
  
  if (process.env.DEBUG) {
    logger.debug('Promise:', promise);
  }
  
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger();
  logger.error('Uncaught exception:', error.message);
  
  if (process.env.DEBUG) {
    logger.debug(error.stack || 'No stack trace available');
  }
  
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main();
}
