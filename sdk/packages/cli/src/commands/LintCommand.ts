/**
 * @fileoverview Lint command for code quality checking in MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha代码质量标准
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn } from 'child_process';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';

/**
 * Lint command for code quality checking
 */
export class LintCommand extends BaseCommand {
  public readonly name = 'lint';
  public readonly description = 'Run linting and code quality checks';
  public readonly aliases = ['check'];
  
  public readonly arguments = [
    {
      name: 'files',
      description: 'Files or patterns to lint',
      required: false
    }
  ];

  public readonly options = [
    {
      flags: '--fix',
      description: 'Automatically fix problems'
    },
    {
      flags: '--cache',
      description: 'Only check changed files'
    },
    {
      flags: '--no-cache',
      description: 'Disable caching'
    },
    {
      flags: '--quiet',
      description: 'Report errors only'
    },
    {
      flags: '--max-warnings <number>',
      description: 'Number of warnings to trigger nonzero exit code',
      defaultValue: '0'
    },
    {
      flags: '--format <format>',
      description: 'Output format',
      choices: ['stylish', 'compact', 'json', 'junit', 'checkstyle'],
      defaultValue: 'stylish'
    },
    {
      flags: '--config <path>',
      description: 'Path to ESLint configuration file'
    },
    {
      flags: '--ignore-path <path>',
      description: 'Path to ignore file'
    },
    {
      flags: '--ext <extensions>',
      description: 'File extensions to lint',
      defaultValue: '.js,.jsx,.ts,.tsx'
    },
    {
      flags: '--typescript',
      description: 'Run TypeScript compiler checks'
    },
    {
      flags: '--prettier',
      description: 'Run Prettier formatting checks'
    }
  ];

  public readonly examples = [
    'mplp lint',
    'mplp lint --fix',
    'mplp lint src/',
    'mplp lint --typescript --prettier',
    'mplp lint --format json --quiet',
    'mplp lint --cache --max-warnings 10'
  ];

  constructor(context: any) {
    super(context);
  }

  /**
   * Execute the lint command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get lint configuration
      const config = await this.getLintConfig(args);
      
      // Run linting
      await this.runLinting(config);
      
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
      this.warn('This doesn\'t appear to be an MPLP project. Linting may not work correctly.');
    }
  }

  /**
   * Get lint configuration
   */
  private async getLintConfig(args: CLICommandArgs): Promise<any> {
    const files = args.args?.[0] || 'src/';
    const fix = this.hasOption(args, 'fix');
    const cache = this.hasOption(args, 'cache') && !this.hasOption(args, 'no-cache');
    const quiet = this.hasOption(args, 'quiet');
    const maxWarnings = parseInt(this.getOption<string>(args, 'max-warnings', '0'), 10);
    const format = this.getOption<string>(args, 'format', 'stylish');
    const configPath = this.getOption<string>(args, 'config');
    const ignorePath = this.getOption<string>(args, 'ignore-path');
    const extensions = this.getOption<string>(args, 'ext', '.js,.jsx,.ts,.tsx');
    const typescript = this.hasOption(args, 'typescript');
    const prettier = this.hasOption(args, 'prettier');

    return {
      files,
      fix,
      cache,
      quiet,
      maxWarnings,
      format,
      configPath,
      ignorePath,
      extensions,
      typescript,
      prettier,
      projectRoot: process.cwd()
    };
  }

  /**
   * Run linting
   */
  private async runLinting(config: any): Promise<void> {
    this.logger.header('Running Code Quality Checks');
    this.logger.info(`Target: ${config.files}`);
    this.logger.info(`Project: ${path.basename(config.projectRoot)}`);
    this.logger.newline();

    // Show lint configuration
    this.showLintConfiguration(config);

    let hasErrors = false;

    try {
      // Run ESLint
      this.logger.subheader('ESLint');
      const eslintResult = await this.runESLint(config);
      if (eslintResult !== 0) {
        hasErrors = true;
      }

      // Run TypeScript checks if requested
      if (config.typescript) {
        this.logger.newline();
        this.logger.subheader('TypeScript Compiler');
        const tscResult = await this.runTypeScriptCheck(config);
        if (tscResult !== 0) {
          hasErrors = true;
        }
      }

      // Run Prettier checks if requested
      if (config.prettier) {
        this.logger.newline();
        this.logger.subheader('Prettier');
        const prettierResult = await this.runPrettierCheck(config);
        if (prettierResult !== 0) {
          hasErrors = true;
        }
      }

      this.logger.newline();
      
      if (hasErrors) {
        this.error('Code quality checks failed');
        process.exit(1);
      } else {
        this.success('All code quality checks passed!');
      }

    } catch (error) {
      this.error(`Failed to run linting: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Show lint configuration
   */
  private showLintConfiguration(config: any): void {
    this.logger.subheader('Configuration');
    
    const features = [];
    if (config.fix) features.push('Auto-fix');
    if (config.cache) features.push('Caching');
    if (config.typescript) features.push('TypeScript');
    if (config.prettier) features.push('Prettier');
    
    const configData: Record<string, string> = {
      'Target': config.files,
      'Format': config.format,
      'Extensions': config.extensions,
      'Max Warnings': config.maxWarnings.toString(),
      'Features': features.join(', ') || 'None'
    };

    if (config.configPath) {
      configData['Config File'] = path.relative(process.cwd(), config.configPath);
    }

    if (config.ignorePath) {
      configData['Ignore File'] = path.relative(process.cwd(), config.ignorePath);
    }
    
    this.logger.table(configData);
    this.logger.newline();
  }

  /**
   * Run ESLint
   */
  private async runESLint(config: any): Promise<number> {
    try {
      const eslintPath = await this.findESLintExecutable();
      const args = this.buildESLintArgs(config);

      this.logger.info('Running ESLint...');
      
      return await this.runCommand(eslintPath, args);

    } catch (error) {
      this.warn(`ESLint not found: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Run TypeScript compiler check
   */
  private async runTypeScriptCheck(config: any): Promise<number> {
    try {
      const tscPath = await this.findTypeScriptExecutable();
      const args = ['--noEmit', '--pretty'];

      this.logger.info('Running TypeScript compiler...');
      
      return await this.runCommand(tscPath, args);

    } catch (error) {
      this.warn(`TypeScript compiler not found: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Run Prettier check
   */
  private async runPrettierCheck(config: any): Promise<number> {
    try {
      const prettierPath = await this.findPrettierExecutable();
      const args = ['--check', config.files];

      this.logger.info('Running Prettier...');
      
      return await this.runCommand(prettierPath, args);

    } catch (error) {
      this.warn(`Prettier not found: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Build ESLint arguments
   */
  private buildESLintArgs(config: any): string[] {
    const args: string[] = [];

    // Add target files/directories
    args.push(config.files);

    // Add options
    if (config.fix) {
      args.push('--fix');
    }

    if (config.cache) {
      args.push('--cache');
    }

    if (config.quiet) {
      args.push('--quiet');
    }

    if (config.maxWarnings > 0) {
      args.push('--max-warnings', config.maxWarnings.toString());
    }

    args.push('--format', config.format);

    if (config.configPath) {
      args.push('--config', config.configPath);
    }

    if (config.ignorePath) {
      args.push('--ignore-path', config.ignorePath);
    }

    args.push('--ext', config.extensions);

    return args;
  }

  /**
   * Find ESLint executable
   */
  private async findESLintExecutable(): Promise<string> {
    const localESLint = path.join(process.cwd(), 'node_modules', '.bin', 'eslint');
    if (await fs.pathExists(localESLint)) {
      return localESLint;
    }

    throw new Error('ESLint not found. Please install ESLint: npm install --save-dev eslint');
  }

  /**
   * Find TypeScript executable
   */
  private async findTypeScriptExecutable(): Promise<string> {
    const localTsc = path.join(process.cwd(), 'node_modules', '.bin', 'tsc');
    if (await fs.pathExists(localTsc)) {
      return localTsc;
    }

    throw new Error('TypeScript not found. Please install TypeScript: npm install --save-dev typescript');
  }

  /**
   * Find Prettier executable
   */
  private async findPrettierExecutable(): Promise<string> {
    const localPrettier = path.join(process.cwd(), 'node_modules', '.bin', 'prettier');
    if (await fs.pathExists(localPrettier)) {
      return localPrettier;
    }

    throw new Error('Prettier not found. Please install Prettier: npm install --save-dev prettier');
  }

  /**
   * Run a command and return exit code
   */
  private async runCommand(command: string, args: string[]): Promise<number> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        resolve(code || 0);
      });

      child.on('error', () => {
        resolve(1);
      });
    });
  }
}
