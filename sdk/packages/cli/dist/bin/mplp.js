#!/usr/bin/env node
"use strict";
/**
 * @fileoverview MPLP CLI executable
 */
Object.defineProperty(exports, "__esModule", { value: true });
const CLIApplication_1 = require("../core/CLIApplication");
const InitCommand_1 = require("../commands/InitCommand");
const GenerateCommand_1 = require("../commands/GenerateCommand");
const DevCommand_1 = require("../commands/DevCommand");
const HelpCommand_1 = require("../commands/HelpCommand");
const InfoCommand_1 = require("../commands/InfoCommand");
const BuildCommand_1 = require("../commands/BuildCommand");
const TestCommand_1 = require("../commands/TestCommand");
const LintCommand_1 = require("../commands/LintCommand");
const CleanCommand_1 = require("../commands/CleanCommand");
const Logger_1 = require("../core/Logger");
const Spinner_1 = require("../core/Spinner");
/**
 * Create CLI configuration
 */
function createCLIConfig() {
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
function createCLIContext(config) {
    return {
        cwd: process.cwd(),
        config,
        logger: new Logger_1.Logger(),
        spinner: new Spinner_1.Spinner()
    };
}
/**
 * Main CLI function
 */
async function main() {
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
            new InitCommand_1.InitCommand(context),
            new GenerateCommand_1.GenerateCommand(context),
            new DevCommand_1.DevCommand(context),
            new BuildCommand_1.BuildCommand(context),
            new TestCommand_1.TestCommand(context),
            new LintCommand_1.LintCommand(context),
            new CleanCommand_1.CleanCommand(context),
            new HelpCommand_1.HelpCommand(context),
            new InfoCommand_1.InfoCommand(context)
        ];
        // Add commands to config
        config.commands = commands;
        // Create and run CLI application
        const app = new CLIApplication_1.CLIApplication(config);
        await app.run();
    }
    catch (error) {
        const logger = new Logger_1.Logger();
        if (error instanceof Error) {
            logger.error(error.message);
            if (process.env.DEBUG) {
                logger.debug(error.stack || 'No stack trace available');
            }
        }
        else {
            logger.error('An unexpected error occurred');
        }
        process.exit(1);
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    const logger = new Logger_1.Logger();
    logger.error('Unhandled promise rejection:', reason);
    if (process.env.DEBUG) {
        logger.debug('Promise:', promise);
    }
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    const logger = new Logger_1.Logger();
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
//# sourceMappingURL=mplp.js.map