/**
 * @fileoverview Clean command for removing build artifacts and cache files
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha清理模式
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs, ProjectCreationError } from '../core/types';

/**
 * Clean command for removing build artifacts and cache files
 */
export class CleanCommand extends BaseCommand {
  public readonly name = 'clean';
  public readonly description = 'Clean build artifacts and cache files';
  public readonly aliases = ['clear'];
  
  public readonly arguments = [];

  public readonly options = [
    {
      flags: '--dist',
      description: 'Clean distribution/build directory only'
    },
    {
      flags: '--cache',
      description: 'Clean cache files only'
    },
    {
      flags: '--deps',
      description: 'Clean node_modules directory'
    },
    {
      flags: '--logs',
      description: 'Clean log files'
    },
    {
      flags: '--all',
      description: 'Clean everything (dist, cache, logs, coverage)'
    },
    {
      flags: '--dry-run',
      description: 'Show what would be deleted without actually deleting'
    },
    {
      flags: '--force',
      description: 'Force deletion without confirmation'
    },
    {
      flags: '--verbose',
      description: 'Show detailed output'
    },
    {
      flags: '--quiet',
      description: 'Suppress output'
    }
  ];

  public readonly examples = [
    'mplp clean',
    'mplp clean --dist',
    'mplp clean --cache --logs',
    'mplp clean --all --force',
    'mplp clean --dry-run --verbose',
    'mplp clean --deps'
  ];

  private readonly defaultCleanTargets = [
    'dist',
    'build',
    '.next',
    'coverage',
    '.nyc_output',
    'lib',
    'es',
    'types'
  ];

  private readonly cacheTargets = [
    '.eslintcache',
    '.tsbuildinfo',
    'tsconfig.tsbuildinfo',
    '.cache',
    'node_modules/.cache',
    '.parcel-cache',
    '.webpack-cache'
  ];

  private readonly logTargets = [
    '*.log',
    'logs',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    'lerna-debug.log*'
  ];

  constructor(context: any) {
    super(context);
  }

  /**
   * Execute the clean command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    try {
      // Validate we're in a project directory
      await this.validateProjectDirectory();
      
      // Get clean configuration
      const config = await this.getCleanConfig(args);
      
      // Run cleaning
      await this.runCleaning(config);
      
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
      this.warn('This doesn\'t appear to be an MPLP project. Cleaning may not work as expected.');
    }
  }

  /**
   * Get clean configuration
   */
  private async getCleanConfig(args: CLICommandArgs): Promise<any> {
    const distOnly = this.hasOption(args, 'dist');
    const cacheOnly = this.hasOption(args, 'cache');
    const depsOnly = this.hasOption(args, 'deps');
    const logsOnly = this.hasOption(args, 'logs');
    const all = this.hasOption(args, 'all');
    const dryRun = this.hasOption(args, 'dry-run');
    const force = this.hasOption(args, 'force');
    const verbose = this.hasOption(args, 'verbose');
    const quiet = this.hasOption(args, 'quiet');

    // Determine what to clean
    let targets: string[] = [];

    if (all) {
      targets = [
        ...this.defaultCleanTargets,
        ...this.cacheTargets,
        ...this.logTargets
      ];
    } else if (distOnly) {
      targets = this.defaultCleanTargets;
    } else if (cacheOnly) {
      targets = this.cacheTargets;
    } else if (depsOnly) {
      targets = ['node_modules'];
    } else if (logsOnly) {
      targets = this.logTargets;
    } else {
      // Default: clean dist and cache
      targets = [...this.defaultCleanTargets, ...this.cacheTargets];
    }

    return {
      targets,
      dryRun,
      force,
      verbose,
      quiet,
      projectRoot: process.cwd()
    };
  }

  /**
   * Run cleaning
   */
  private async runCleaning(config: any): Promise<void> {
    if (!config.quiet) {
      this.logger.header('Cleaning MPLP Project');
      this.logger.info(`Project: ${path.basename(config.projectRoot)}`);
      
      if (config.dryRun) {
        this.logger.info('Mode: Dry run (no files will be deleted)');
      }
      
      this.logger.newline();
    }

    // Find files and directories to clean
    const itemsToClean = await this.findItemsToClean(config);

    if (itemsToClean.length === 0) {
      if (!config.quiet) {
        this.success('Nothing to clean - project is already clean!');
      }
      return;
    }

    // Show what will be cleaned
    if (!config.quiet) {
      await this.showCleanTargets(itemsToClean, config);
    }

    // Confirm deletion unless force is used
    if (!config.force && !config.dryRun) {
      const confirmed = await this.confirmDeletion(itemsToClean);
      if (!confirmed) {
        this.logger.info('Clean operation cancelled');
        return;
      }
    }

    // Perform cleaning
    if (config.dryRun) {
      if (!config.quiet) {
        this.logger.newline();
        this.success(`Dry run completed - ${itemsToClean.length} items would be deleted`);
      }
    } else {
      await this.performCleaning(itemsToClean, config);
    }
  }

  /**
   * Find items to clean
   */
  private async findItemsToClean(config: any): Promise<string[]> {
    const itemsToClean: string[] = [];

    for (const target of config.targets) {
      const fullPath = path.join(config.projectRoot, target);

      // Handle glob patterns for log files
      if (target.includes('*')) {
        const glob = require('glob');
        const matches = glob.sync(target, { cwd: config.projectRoot });
        
        for (const match of matches) {
          const matchPath = path.join(config.projectRoot, match);
          if (await fs.pathExists(matchPath)) {
            itemsToClean.push(matchPath);
          }
        }
      } else {
        // Handle regular files and directories
        if (await fs.pathExists(fullPath)) {
          itemsToClean.push(fullPath);
        }
      }
    }

    return itemsToClean;
  }

  /**
   * Show clean targets
   */
  private async showCleanTargets(itemsToClean: string[], config: any): Promise<void> {
    this.logger.subheader('Items to Clean');

    if (config.verbose) {
      for (const item of itemsToClean) {
        const relativePath = path.relative(config.projectRoot, item);
        const stats = await fs.stat(item).catch(() => null);
        
        if (stats) {
          const size = stats.isDirectory() ? 
            await this.getDirectorySize(item) : 
            stats.size;
          
          const formattedSize = this.formatFileSize(size);
          const type = stats.isDirectory() ? 'directory' : 'file';
          
          this.logger.info(`  ${relativePath} (${type}, ${formattedSize})`);
        } else {
          this.logger.info(`  ${relativePath}`);
        }
      }
    } else {
      const totalSize = await this.getTotalSize(itemsToClean);
      const formattedSize = this.formatFileSize(totalSize);
      
      this.logger.info(`Found ${itemsToClean.length} items to clean (${formattedSize})`);
      
      // Show first few items
      const displayItems = itemsToClean.slice(0, 5);
      for (const item of displayItems) {
        const relativePath = path.relative(config.projectRoot, item);
        this.logger.info(`  ${relativePath}`);
      }
      
      if (itemsToClean.length > 5) {
        this.logger.info(`  ... and ${itemsToClean.length - 5} more items`);
      }
    }

    this.logger.newline();
  }

  /**
   * Confirm deletion
   */
  private async confirmDeletion(itemsToClean: string[]): Promise<boolean> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(
        `Are you sure you want to delete ${itemsToClean.length} items? (y/N): `,
        (answer: string) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        }
      );
    });
  }

  /**
   * Perform cleaning
   */
  private async performCleaning(itemsToClean: string[], config: any): Promise<void> {
    let deletedCount = 0;
    let totalSize = 0;

    if (!config.quiet) {
      this.logger.info('Deleting items...');
    }

    for (const item of itemsToClean) {
      try {
        const stats = await fs.stat(item).catch(() => null);
        if (stats) {
          const size = stats.isDirectory() ? 
            await this.getDirectorySize(item) : 
            stats.size;
          totalSize += size;
        }

        await fs.remove(item);
        deletedCount++;

        if (config.verbose && !config.quiet) {
          const relativePath = path.relative(config.projectRoot, item);
          this.logger.info(`  Deleted: ${relativePath}`);
        }

      } catch (error) {
        if (!config.quiet) {
          const relativePath = path.relative(config.projectRoot, item);
          this.warn(`Failed to delete: ${relativePath} - ${(error as Error).message}`);
        }
      }
    }

    if (!config.quiet) {
      this.logger.newline();
      const formattedSize = this.formatFileSize(totalSize);
      this.success(`Cleaned ${deletedCount} items (${formattedSize} freed)`);
    }
  }

  /**
   * Get directory size recursively
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch {
      // Ignore errors (permission issues, etc.)
    }

    return totalSize;
  }

  /**
   * Get total size of all items
   */
  private async getTotalSize(items: string[]): Promise<number> {
    let totalSize = 0;

    for (const item of items) {
      try {
        const stats = await fs.stat(item);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(item);
        } else {
          totalSize += stats.size;
        }
      } catch {
        // Ignore errors
      }
    }

    return totalSize;
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
}
