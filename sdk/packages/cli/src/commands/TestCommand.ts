/**
 * @fileoverview Test command for running tests in MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha测试模式
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';

/**
 * Test command for running tests in MPLP projects
 */
export class TestCommand extends BaseCommand {
  public readonly name = 'test';
  public readonly description = 'Run tests for the project';
  public readonly aliases = ['t'];
  
  public readonly arguments = [
    {
      name: 'pattern',
      description: 'Test file pattern to run',
      required: false
    }
  ];

  public readonly options = [
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

  public readonly examples = [
    'mplp test',
    'mplp test --watch',
    'mplp test --coverage',
    'mplp test --verbose --bail',
    'mplp test "**/*.test.ts"',
    'mplp test --ci --coverage --verbose'
  ];

  constructor(context: any) {
    super(context);
  }

  /**
   * Execute the test command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get test configuration
      const config = await this.getTestConfig(args);
      
      // Run tests
      await this.runTests(config);
      
    } catch (error) {
      throw new ProjectCreationError((error as Error).message, error as Error);
    }
  }

  /**
   * Validate we're in a project directory
   */
  private async validateProjectDirectory(): Promise<void> {
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

    const hasJestConfig = jestConfigPaths.some(configPath => 
      fs.existsSync(path.join(process.cwd(), configPath))
    );

    if (!hasJestConfig && !packageJson.jest) {
      this.warn('No Jest configuration found. Tests may not run correctly.');
    }
  }

  /**
   * Get test configuration
   */
  private async getTestConfig(args: CLICommandArgs): Promise<any> {
    const pattern = args.args?.[0];
    const watch = this.hasOption(args, 'watch');
    const coverage = this.hasOption(args, 'coverage');
    const verbose = this.hasOption(args, 'verbose');
    const silent = this.hasOption(args, 'silent');
    const bail = this.hasOption(args, 'bail');
    const ci = this.hasOption(args, 'ci');
    const updateSnapshots = this.hasOption(args, 'update-snapshots');
    const maxWorkers = this.getOption<string>(args, 'max-workers');
    const timeout = parseInt(this.getOption<string>(args, 'timeout', '30000'), 10);
    const configPath = this.getOption<string>(args, 'config');
    const environment = this.getOption<string>(args, 'env', 'node');

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
  private async runTests(config: any): Promise<void> {
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
      } else {
        this.logger.newline();
        this.error('Some tests failed');
        process.exit(exitCode);
      }

    } catch (error) {
      this.error(`Failed to run tests: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Show test configuration
   */
  private showTestConfiguration(config: any): void {
    this.logger.subheader('Test Configuration');
    
    const features = [];
    if (config.watch) features.push('Watch Mode');
    if (config.coverage) features.push('Coverage Report');
    if (config.verbose) features.push('Verbose Output');
    if (config.ci) features.push('CI Mode');
    if (config.updateSnapshots) features.push('Update Snapshots');
    
    const configData: Record<string, string> = {
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
  private buildJestArgs(config: any): string[] {
    const args: string[] = [];

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
  private async findJestExecutable(): Promise<string> {
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
    } catch {
      // Global Jest not found
    }

    throw new Error('Jest not found. Please install Jest: npm install --save-dev jest');
  }

  /**
   * Run Jest with the specified arguments
   */
  private async runJest(jestPath: string, args: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      const child = spawn(jestPath, args, {
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
