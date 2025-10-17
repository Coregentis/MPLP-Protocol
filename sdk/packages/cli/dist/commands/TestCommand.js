"use strict";
/**
 * @fileoverview Test command for running tests in MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha测试模式
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCommand = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
const BaseCommand_1 = require("./BaseCommand");
const types_1 = require("../core/types");
/**
 * Test command for running tests in MPLP projects
 */
class TestCommand extends BaseCommand_1.BaseCommand {
    constructor(context) {
        super(context);
        this.name = 'test';
        this.description = 'Run tests for the project';
        this.aliases = ['t'];
        this.arguments = [
            {
                name: 'pattern',
                description: 'Test file pattern to run',
                required: false
            }
        ];
        this.options = [
            {
                flags: '--watch',
                description: 'Run tests in watch mode'
            },
            {
                flags: '--coverage',
                description: 'Generate test coverage report'
            },
            {
                flags: '--verbose',
                description: 'Display individual test results'
            },
            {
                flags: '--silent',
                description: 'Prevent tests from printing messages through console'
            },
            {
                flags: '--bail',
                description: 'Stop running tests after the first test failure'
            },
            {
                flags: '--ci',
                description: 'Run tests in CI mode'
            },
            {
                flags: '--update-snapshots',
                description: 'Update test snapshots'
            },
            {
                flags: '--max-workers <num>',
                description: 'Maximum number of worker processes'
            },
            {
                flags: '--timeout <ms>',
                description: 'Test timeout in milliseconds',
                defaultValue: '30000'
            },
            {
                flags: '--config <path>',
                description: 'Path to Jest configuration file'
            },
            {
                flags: '--env <environment>',
                description: 'Test environment',
                choices: ['node', 'jsdom'],
                defaultValue: 'node'
            }
        ];
        this.examples = [
            'mplp test',
            'mplp test --watch',
            'mplp test --coverage',
            'mplp test --verbose --bail',
            'mplp test "**/*.test.ts"',
            'mplp test --ci --coverage --verbose'
        ];
    }
    /**
     * Execute the test command
     */
    async execute(args) {
        try {
            // Validate we're in a project directory
            await this.validateProjectDirectory();
            // Get test configuration
            const config = await this.getTestConfig(args);
            // Run tests
            await this.runTests(config);
        }
        catch (error) {
            throw new types_1.ProjectCreationError(error.message, error);
        }
    }
    /**
     * Validate we're in a project directory
     */
    async validateProjectDirectory() {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!await fs.pathExists(packageJsonPath)) {
            throw new Error('Not in a project directory. Run this command from the root of an MPLP project.');
        }
        const packageJson = await fs.readJson(packageJsonPath);
        const hasMPLPDeps = Object.keys({
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        }).some(dep => dep.startsWith('@mplp/'));
        if (!hasMPLPDeps) {
            this.warn('This doesn\'t appear to be an MPLP project. Tests may not work correctly.');
        }
        // Check for Jest configuration
        const jestConfigPaths = [
            'jest.config.js',
            'jest.config.ts',
            'jest.config.json'
        ];
        const hasJestConfig = jestConfigPaths.some(configPath => fs.existsSync(path.join(process.cwd(), configPath)));
        if (!hasJestConfig && !packageJson.jest) {
            this.warn('No Jest configuration found. Tests may not run correctly.');
        }
    }
    /**
     * Get test configuration
     */
    async getTestConfig(args) {
        const pattern = args.args?.[0];
        const watch = this.hasOption(args, 'watch');
        const coverage = this.hasOption(args, 'coverage');
        const verbose = this.hasOption(args, 'verbose');
        const silent = this.hasOption(args, 'silent');
        const bail = this.hasOption(args, 'bail');
        const ci = this.hasOption(args, 'ci');
        const updateSnapshots = this.hasOption(args, 'update-snapshots');
        const maxWorkers = this.getOption(args, 'max-workers');
        const timeout = parseInt(this.getOption(args, 'timeout', '30000'), 10);
        const configPath = this.getOption(args, 'config');
        const environment = this.getOption(args, 'env', 'node');
        return {
            pattern,
            watch,
            coverage,
            verbose,
            silent,
            bail,
            ci,
            updateSnapshots,
            maxWorkers,
            timeout,
            configPath,
            environment,
            projectRoot: process.cwd()
        };
    }
    /**
     * Run tests
     */
    async runTests(config) {
        this.logger.header('Running MPLP Tests');
        this.logger.info(`Environment: ${config.environment}`);
        this.logger.info(`Project: ${path.basename(config.projectRoot)}`);
        this.logger.newline();
        // Show test configuration
        this.showTestConfiguration(config);
        // Build Jest command arguments
        const jestArgs = this.buildJestArgs(config);
        try {
            // Check if Jest is available
            const jestPath = await this.findJestExecutable();
            this.logger.info('Starting test runner...');
            this.logger.newline();
            // Run Jest
            const exitCode = await this.runJest(jestPath, jestArgs);
            if (exitCode === 0) {
                this.logger.newline();
                this.success('All tests passed!');
            }
            else {
                this.logger.newline();
                this.error('Some tests failed');
                process.exit(exitCode);
            }
        }
        catch (error) {
            this.error(`Failed to run tests: ${error.message}`);
            throw error;
        }
    }
    /**
     * Show test configuration
     */
    showTestConfiguration(config) {
        this.logger.subheader('Test Configuration');
        const features = [];
        if (config.watch)
            features.push('Watch Mode');
        if (config.coverage)
            features.push('Coverage Report');
        if (config.verbose)
            features.push('Verbose Output');
        if (config.ci)
            features.push('CI Mode');
        if (config.updateSnapshots)
            features.push('Update Snapshots');
        const configData = {
            'Environment': config.environment,
            'Timeout': `${config.timeout}ms`,
            'Features': features.join(', ') || 'None'
        };
        if (config.pattern) {
            configData['Pattern'] = config.pattern;
        }
        if (config.maxWorkers) {
            configData['Max Workers'] = config.maxWorkers;
        }
        if (config.configPath) {
            configData['Config File'] = path.relative(process.cwd(), config.configPath);
        }
        this.logger.table(configData);
        this.logger.newline();
    }
    /**
     * Build Jest command arguments
     */
    buildJestArgs(config) {
        const args = [];
        // Add pattern if specified
        if (config.pattern) {
            args.push(config.pattern);
        }
        // Add options
        if (config.watch) {
            args.push('--watch');
        }
        if (config.coverage) {
            args.push('--coverage');
        }
        if (config.verbose) {
            args.push('--verbose');
        }
        if (config.silent) {
            args.push('--silent');
        }
        if (config.bail) {
            args.push('--bail');
        }
        if (config.ci) {
            args.push('--ci');
        }
        if (config.updateSnapshots) {
            args.push('--updateSnapshot');
        }
        if (config.maxWorkers) {
            args.push('--maxWorkers', config.maxWorkers);
        }
        if (config.timeout !== 30000) {
            args.push('--testTimeout', config.timeout.toString());
        }
        if (config.configPath) {
            args.push('--config', config.configPath);
        }
        // Set test environment
        args.push('--testEnvironment', config.environment);
        // Add colors for better output
        args.push('--colors');
        return args;
    }
    /**
     * Find Jest executable
     */
    async findJestExecutable() {
        // Try local Jest first
        const localJest = path.join(process.cwd(), 'node_modules', '.bin', 'jest');
        if (await fs.pathExists(localJest)) {
            return localJest;
        }
        // Try global Jest
        try {
            const { execSync } = require('child_process');
            const globalJest = execSync('which jest', { encoding: 'utf8' }).trim();
            if (globalJest) {
                return globalJest;
            }
        }
        catch {
            // Global Jest not found
        }
        throw new Error('Jest not found. Please install Jest: npm install --save-dev jest');
    }
    /**
     * Run Jest with the specified arguments
     */
    async runJest(jestPath, args) {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(jestPath, args, {
                stdio: 'inherit',
                cwd: process.cwd(),
                env: {
                    ...process.env,
                    NODE_ENV: 'test'
                }
            });
            child.on('close', (code) => {
                resolve(code || 0);
            });
            child.on('error', (error) => {
                reject(error);
            });
            // Handle graceful shutdown
            process.on('SIGINT', () => {
                child.kill('SIGINT');
            });
            process.on('SIGTERM', () => {
                child.kill('SIGTERM');
            });
        });
    }
}
exports.TestCommand = TestCommand;
//# sourceMappingURL=TestCommand.js.map