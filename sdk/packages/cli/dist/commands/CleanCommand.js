"use strict";
/**
 * @fileoverview Clean command for removing build artifacts and cache files
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha清理模式
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
exports.CleanCommand = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const BaseCommand_1 = require("./BaseCommand");
const types_1 = require("../core/types");
/**
 * Clean command for removing build artifacts and cache files
 */
class CleanCommand extends BaseCommand_1.BaseCommand {
    constructor(context) {
        super(context);
        this.name = 'clean';
        this.description = 'Clean build artifacts and cache files';
        this.aliases = ['clear'];
        this.arguments = [];
        this.options = [
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
        this.examples = [
            'mplp clean',
            'mplp clean --dist',
            'mplp clean --cache --logs',
            'mplp clean --all --force',
            'mplp clean --dry-run --verbose',
            'mplp clean --deps'
        ];
        this.defaultCleanTargets = [
            'dist',
            'build',
            '.next',
            'coverage',
            '.nyc_output',
            'lib',
            'es',
            'types'
        ];
        this.cacheTargets = [
            '.eslintcache',
            '.tsbuildinfo',
            'tsconfig.tsbuildinfo',
            '.cache',
            'node_modules/.cache',
            '.parcel-cache',
            '.webpack-cache'
        ];
        this.logTargets = [
            '*.log',
            'logs',
            'npm-debug.log*',
            'yarn-debug.log*',
            'yarn-error.log*',
            'lerna-debug.log*'
        ];
    }
    /**
     * Execute the clean command
     */
    async execute(args) {
        try {
            // Validate we're in a project directory
            await this.validateProjectDirectory();
            // Get clean configuration
            const config = await this.getCleanConfig(args);
            // Run cleaning
            await this.runCleaning(config);
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
            this.warn('This doesn\'t appear to be an MPLP project. Cleaning may not work as expected.');
        }
    }
    /**
     * Get clean configuration
     */
    async getCleanConfig(args) {
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
        let targets = [];
        if (all) {
            targets = [
                ...this.defaultCleanTargets,
                ...this.cacheTargets,
                ...this.logTargets
            ];
        }
        else if (distOnly) {
            targets = this.defaultCleanTargets;
        }
        else if (cacheOnly) {
            targets = this.cacheTargets;
        }
        else if (depsOnly) {
            targets = ['node_modules'];
        }
        else if (logsOnly) {
            targets = this.logTargets;
        }
        else {
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
    async runCleaning(config) {
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
        }
        else {
            await this.performCleaning(itemsToClean, config);
        }
    }
    /**
     * Find items to clean
     */
    async findItemsToClean(config) {
        const itemsToClean = [];
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
            }
            else {
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
    async showCleanTargets(itemsToClean, config) {
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
                }
                else {
                    this.logger.info(`  ${relativePath}`);
                }
            }
        }
        else {
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
    async confirmDeletion(itemsToClean) {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(`Are you sure you want to delete ${itemsToClean.length} items? (y/N): `, (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
            });
        });
    }
    /**
     * Perform cleaning
     */
    async performCleaning(itemsToClean, config) {
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
            }
            catch (error) {
                if (!config.quiet) {
                    const relativePath = path.relative(config.projectRoot, item);
                    this.warn(`Failed to delete: ${relativePath} - ${error.message}`);
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
    async getDirectorySize(dirPath) {
        let totalSize = 0;
        try {
            const items = await fs.readdir(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                if (stats.isDirectory()) {
                    totalSize += await this.getDirectorySize(itemPath);
                }
                else {
                    totalSize += stats.size;
                }
            }
        }
        catch {
            // Ignore errors (permission issues, etc.)
        }
        return totalSize;
    }
    /**
     * Get total size of all items
     */
    async getTotalSize(items) {
        let totalSize = 0;
        for (const item of items) {
            try {
                const stats = await fs.stat(item);
                if (stats.isDirectory()) {
                    totalSize += await this.getDirectorySize(item);
                }
                else {
                    totalSize += stats.size;
                }
            }
            catch {
                // Ignore errors
            }
        }
        return totalSize;
    }
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.CleanCommand = CleanCommand;
//# sourceMappingURL=CleanCommand.js.map