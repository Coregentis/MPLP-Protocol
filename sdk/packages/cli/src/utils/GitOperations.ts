/**
 * @fileoverview Git operations utility
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { GitOperations as IGitOperations } from '../core/types';

/**
 * Git operations implementation
 */
export class GitOperations implements IGitOperations {
  /**
   * Initialize a Git repository
   */
  public async init(cwd: string): Promise<void> {
    await this.runGitCommand(cwd, ['init']);
  }

  /**
   * Add files to Git staging area
   */
  public async add(cwd: string, files: string[]): Promise<void> {
    await this.runGitCommand(cwd, ['add', ...files]);
  }

  /**
   * Commit changes
   */
  public async commit(cwd: string, message: string): Promise<void> {
    await this.runGitCommand(cwd, ['commit', '-m', message]);
  }

  /**
   * Check if directory is a Git repository
   */
  public isRepository(cwd: string): boolean {
    return fs.existsSync(path.join(cwd, '.git'));
  }

  /**
   * Get Git configuration value
   */
  public async getConfig(key: string): Promise<string | undefined> {
    try {
      const result = await this.runGitCommand(process.cwd(), ['config', '--get', key], true);
      return result.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Set Git configuration value
   */
  public async setConfig(key: string, value: string, global: boolean = false): Promise<void> {
    const args = ['config'];
    if (global) {
      args.push('--global');
    }
    args.push(key, value);
    
    await this.runGitCommand(process.cwd(), args);
  }

  /**
   * Get current branch name
   */
  public async getCurrentBranch(cwd: string): Promise<string> {
    const result = await this.runGitCommand(cwd, ['branch', '--show-current'], true);
    return result.trim();
  }

  /**
   * Get Git status
   */
  public async getStatus(cwd: string): Promise<{
    staged: string[];
    unstaged: string[];
    untracked: string[];
  }> {
    const result = await this.runGitCommand(cwd, ['status', '--porcelain'], true);
    const lines = result.split('\n').filter(line => line.trim());
    
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];
    
    for (const line of lines) {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      if (status[0] !== ' ' && status[0] !== '?') {
        staged.push(file);
      }
      
      if (status[1] !== ' ') {
        if (status[1] === '?') {
          untracked.push(file);
        } else {
          unstaged.push(file);
        }
      }
    }
    
    return { staged, unstaged, untracked };
  }

  /**
   * Check if Git is available
   */
  public async isGitAvailable(): Promise<boolean> {
    try {
      await this.runGitCommand(process.cwd(), ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Git version
   */
  public async getVersion(): Promise<string | null> {
    try {
      const result = await this.runGitCommand(process.cwd(), ['--version'], true);
      const match = result.match(/git version (.+)/);
      return match ? match[1].trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Clone a repository
   */
  public async clone(url: string, targetPath: string, options?: {
    branch?: string;
    depth?: number;
    recursive?: boolean;
  }): Promise<void> {
    const args = ['clone'];
    
    if (options?.branch) {
      args.push('--branch', options.branch);
    }
    
    if (options?.depth) {
      args.push('--depth', options.depth.toString());
    }
    
    if (options?.recursive) {
      args.push('--recursive');
    }
    
    args.push(url, targetPath);
    
    await this.runGitCommand(process.cwd(), args);
  }

  /**
   * Create and checkout a new branch
   */
  public async createBranch(cwd: string, branchName: string, checkout: boolean = true): Promise<void> {
    const args = ['branch', branchName];
    await this.runGitCommand(cwd, args);
    
    if (checkout) {
      await this.runGitCommand(cwd, ['checkout', branchName]);
    }
  }

  /**
   * Checkout a branch
   */
  public async checkout(cwd: string, branchName: string): Promise<void> {
    await this.runGitCommand(cwd, ['checkout', branchName]);
  }

  /**
   * Get list of branches
   */
  public async getBranches(cwd: string, includeRemote: boolean = false): Promise<{
    current: string;
    local: string[];
    remote: string[];
  }> {
    const args = ['branch'];
    if (includeRemote) {
      args.push('-a');
    }
    
    const result = await this.runGitCommand(cwd, args, true);
    const lines = result.split('\n').filter(line => line.trim());
    
    let current = '';
    const local: string[] = [];
    const remote: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ')) {
        current = trimmed.substring(2);
        local.push(current);
      } else if (trimmed.startsWith('remotes/')) {
        remote.push(trimmed.substring(8));
      } else if (trimmed) {
        local.push(trimmed);
      }
    }
    
    return { current, local, remote };
  }

  /**
   * Get commit history
   */
  public async getCommits(cwd: string, limit: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    const format = '--pretty=format:%H|%s|%an|%ad';
    const result = await this.runGitCommand(cwd, [
      'log',
      format,
      '--date=iso',
      `-${limit}`
    ], true);
    
    const lines = result.split('\n').filter(line => line.trim());
    const commits = [];
    
    for (const line of lines) {
      const [hash, message, author, date] = line.split('|');
      commits.push({ hash, message, author, date });
    }
    
    return commits;
  }

  /**
   * Check if working directory is clean
   */
  public async isWorkingDirectoryClean(cwd: string): Promise<boolean> {
    const status = await this.getStatus(cwd);
    return status.staged.length === 0 && 
           status.unstaged.length === 0 && 
           status.untracked.length === 0;
  }

  /**
   * Run a Git command
   */
  private async runGitCommand(
    cwd: string, 
    args: string[], 
    captureOutput: boolean = false
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn('git', args, {
        cwd,
        stdio: captureOutput ? 'pipe' : 'inherit',
        shell: true
      });

      let output = '';
      let error = '';

      if (captureOutput) {
        child.stdout?.on('data', (data) => {
          output += data.toString();
        });

        child.stderr?.on('data', (data) => {
          error += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          const errorMessage = error || `Git command failed with code ${code}`;
          reject(new Error(errorMessage));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to run git command: ${err.message}`));
      });
    });
  }
}
