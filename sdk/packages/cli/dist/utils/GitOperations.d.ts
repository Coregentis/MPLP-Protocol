/**
 * @fileoverview Git operations utility
 */
import { GitOperations as IGitOperations } from '../core/types';
/**
 * Git operations implementation
 */
export declare class GitOperations implements IGitOperations {
    /**
     * Initialize a Git repository
     */
    init(cwd: string): Promise<void>;
    /**
     * Add files to Git staging area
     */
    add(cwd: string, files: string[]): Promise<void>;
    /**
     * Commit changes
     */
    commit(cwd: string, message: string): Promise<void>;
    /**
     * Check if directory is a Git repository
     */
    isRepository(cwd: string): boolean;
    /**
     * Get Git configuration value
     */
    getConfig(key: string): Promise<string | undefined>;
    /**
     * Set Git configuration value
     */
    setConfig(key: string, value: string, global?: boolean): Promise<void>;
    /**
     * Get current branch name
     */
    getCurrentBranch(cwd: string): Promise<string>;
    /**
     * Get Git status
     */
    getStatus(cwd: string): Promise<{
        staged: string[];
        unstaged: string[];
        untracked: string[];
    }>;
    /**
     * Check if Git is available
     */
    isGitAvailable(): Promise<boolean>;
    /**
     * Get Git version
     */
    getVersion(): Promise<string | null>;
    /**
     * Clone a repository
     */
    clone(url: string, targetPath: string, options?: {
        branch?: string;
        depth?: number;
        recursive?: boolean;
    }): Promise<void>;
    /**
     * Create and checkout a new branch
     */
    createBranch(cwd: string, branchName: string, checkout?: boolean): Promise<void>;
    /**
     * Checkout a branch
     */
    checkout(cwd: string, branchName: string): Promise<void>;
    /**
     * Get list of branches
     */
    getBranches(cwd: string, includeRemote?: boolean): Promise<{
        current: string;
        local: string[];
        remote: string[];
    }>;
    /**
     * Get commit history
     */
    getCommits(cwd: string, limit?: number): Promise<Array<{
        hash: string;
        message: string;
        author: string;
        date: string;
    }>>;
    /**
     * Check if working directory is clean
     */
    isWorkingDirectoryClean(cwd: string): Promise<boolean>;
    /**
     * Run a Git command
     */
    private runGitCommand;
}
//# sourceMappingURL=GitOperations.d.ts.map