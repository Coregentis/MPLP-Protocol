/**
 * @fileoverview Clean command for removing build artifacts and cache files
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha清理模式
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Clean command for removing build artifacts and cache files
 */
export declare class CleanCommand extends BaseCommand {
    readonly name = "clean";
    readonly description = "Clean build artifacts and cache files";
    readonly aliases: string[];
    readonly arguments: any[];
    readonly options: {
        flags: string;
        description: string;
    }[];
    readonly examples: string[];
    private readonly defaultCleanTargets;
    private readonly cacheTargets;
    private readonly logTargets;
    constructor(context: any);
    /**
     * Execute the clean command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get clean configuration
     */
    private getCleanConfig;
    /**
     * Run cleaning
     */
    private runCleaning;
    /**
     * Find items to clean
     */
    private findItemsToClean;
    /**
     * Show clean targets
     */
    private showCleanTargets;
    /**
     * Confirm deletion
     */
    private confirmDeletion;
    /**
     * Perform cleaning
     */
    private performCleaning;
    /**
     * Get directory size recursively
     */
    private getDirectorySize;
    /**
     * Get total size of all items
     */
    private getTotalSize;
    /**
     * Format file size
     */
    private formatFileSize;
}
//# sourceMappingURL=CleanCommand.d.ts.map