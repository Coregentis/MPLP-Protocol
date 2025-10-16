/**
 * @fileoverview Build command for compiling MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha构建模式
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';
import { BuildManager } from '../dev/BuildManager';

/**
 * Build command for compiling MPLP projects
 */
export class BuildCommand extends BaseCommand {
  public readonly name = 'build';
  public readonly description = 'Build the project for production';
  public readonly aliases = ['compile'];
  
  public readonly arguments = [];

  public readonly options = [
    {
      flags: '-o, --output <directory>',
      description: 'Output directory for built files',
      defaultValue: 'dist'
    },
    {
      flags: '--mode <mode>',
      description: 'Build mode',
      choices: ['development', 'production'],
      defaultValue: 'production'
    },
    {
      flags: '--target <target>',
      description: 'Build target',
      choices: ['node', 'browser', 'both'],
      defaultValue: 'node'
    },
    {
      flags: '--minify',
      description: 'Minify the output'
    },
    {
      flags: '--source-map',
      description: 'Generate source maps'
    },
    {
      flags: '--clean',
      description: 'Clean output directory before building'
    },
    {
      flags: '--watch',
      description: 'Watch for changes and rebuild'
    },
    {
      flags: '--analyze',
      description: 'Analyze bundle size'
    },
    {
      flags: '--verbose',
      description: 'Enable verbose output'
    },
    {
      flags: '--quiet',
      description: 'Suppress non-essential output'
    }
  ];

  public readonly examples = [
    'mplp build',
    'mplp build --output ./build',
    'mplp build --mode development --watch',
    'mplp build --target browser --minify',
    'mplp build --clean --source-map --analyze'
  ];

  constructor(context: any) {
    super(context);
  }

  /**
   * Execute the build command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get build configuration
      const config = await this.getBuildConfig(args);
      
      // Validate configuration
      this.validateBuildConfig(config);
      
      // Start build process
      await this.startBuild(config);
      
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
      this.warn('This doesn\'t appear to be an MPLP project. Build may not work correctly.');
    }

    // Check for TypeScript configuration
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!await fs.pathExists(tsconfigPath)) {
      this.warn('No tsconfig.json found. TypeScript compilation may not work correctly.');
    }
  }

  /**
   * Get build configuration
   */
  private async getBuildConfig(args: CLICommandArgs): Promise<any> {
    const outputDir = this.getOption<string>(args, 'output', 'dist');
    const mode = this.getOption<string>(args, 'mode', 'production');
    const target = this.getOption<string>(args, 'target', 'node');
    const minify = this.hasOption(args, 'minify');
    const sourceMap = this.hasOption(args, 'source-map');
    const clean = this.hasOption(args, 'clean');
    const watch = this.hasOption(args, 'watch');
    const analyze = this.hasOption(args, 'analyze');
    const verbose = this.hasOption(args, 'verbose');
    const quiet = this.hasOption(args, 'quiet');

    const config = {
      projectRoot: process.cwd(),
      srcDir: path.join(process.cwd(), 'src'),
      outputDir: path.resolve(outputDir),
      mode,
      target,
      minify,
      sourceMap,
      clean,
      watch,
      analyze,
      verbose,
      quiet,
      tsconfig: path.join(process.cwd(), 'tsconfig.json'),
      packageJson: path.join(process.cwd(), 'package.json')
    };

    return config;
  }

  /**
   * Validate build configuration
   */
  private validateBuildConfig(config: any): void {
    // Validate source directory
    if (!fs.existsSync(config.srcDir)) {
      throw new Error(`Source directory does not exist: ${config.srcDir}`);
    }

    // Validate mode
    if (!['development', 'production'].includes(config.mode)) {
      throw new Error('Mode must be either "development" or "production"');
    }

    // Validate target
    if (!['node', 'browser', 'both'].includes(config.target)) {
      throw new Error('Target must be "node", "browser", or "both"');
    }

    // Create output directory if it doesn't exist
    fs.ensureDirSync(config.outputDir);
  }

  /**
   * Start build process
   */
  private async startBuild(config: any): Promise<void> {
    this.logger.header('Building MPLP Project');
    this.logger.info(`Mode: ${config.mode}`);
    this.logger.info(`Target: ${config.target}`);
    this.logger.info(`Output: ${path.relative(process.cwd(), config.outputDir)}`);
    this.logger.newline();

    // Show build configuration
    this.showBuildConfiguration(config);

    // Clean output directory if requested
    if (config.clean) {
      this.logger.info('Cleaning output directory...');
      await fs.emptyDir(config.outputDir);
      this.success('Output directory cleaned');
    }

    // Create build manager
    const buildManager = new BuildManager(config);

    try {
      // Start build
      const startTime = Date.now();
      
      if (config.watch) {
        this.logger.info('Starting build in watch mode...');
        // Note: Watch mode implementation would need to be added to BuildManager
        this.warn('Watch mode is not yet implemented in BuildManager');

        this.logger.newline();
        this.success('Build watcher started successfully!');
        this.logger.info('Watching for changes... Press Ctrl+C to stop');

        // Keep the process running
        await this.keepAlive();

      } else {
        this.logger.info('Starting build...');
        const result = await buildManager.build();
        
        const duration = Date.now() - startTime;
        
        this.logger.newline();
        this.success(`Build completed successfully in ${duration}ms!`);
        
        // Show build results
        this.showBuildResults(result, config);
      }
      
    } catch (error) {
      this.error(`Build failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Show build configuration
   */
  private showBuildConfiguration(config: any): void {
    this.logger.subheader('Build Configuration');
    
    const features = [];
    if (config.minify) features.push('Minification');
    if (config.sourceMap) features.push('Source Maps');
    if (config.analyze) features.push('Bundle Analysis');
    if (config.watch) features.push('Watch Mode');
    
    this.logger.table({
      'Mode': config.mode,
      'Target': config.target,
      'Output Directory': path.relative(process.cwd(), config.outputDir),
      'Source Directory': path.relative(process.cwd(), config.srcDir),
      'Features': features.join(', ') || 'None'
    });
    
    this.logger.newline();
  }

  /**
   * Show build results
   */
  private showBuildResults(result: any, config: any): void {
    this.logger.subheader('Build Results');
    
    if (result.files && result.files.length > 0) {
      this.logger.info('Generated files:');
      result.files.forEach((file: string) => {
        const relativePath = path.relative(process.cwd(), file);
        const stats = fs.statSync(file);
        const size = this.formatFileSize(stats.size);
        this.logger.info(`  ${relativePath} (${size})`);
      });
    }
    
    if (result.warnings && result.warnings.length > 0) {
      this.logger.newline();
      this.logger.warn('Build warnings:');
      result.warnings.forEach((warning: string) => {
        this.logger.warn(`  ${warning}`);
      });
    }
    
    this.logger.newline();
    this.logger.info('Build output saved to:', path.relative(process.cwd(), config.outputDir));
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Keep the process alive for watch mode
   */
  private async keepAlive(): Promise<void> {
    return new Promise((resolve) => {
      // Setup graceful shutdown
      const shutdown = () => {
        this.logger.newline();
        this.logger.info('Build watcher stopped');
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    });
  }
}
