"use strict";
/**
 * @fileoverview Git operations utility
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
exports.GitOperations = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * Git operations implementation
 */
class GitOperations {
    /**
     * Initialize a Git repository
     */
    async init(cwd) {
        await this.runGitCommand(cwd, ['init']);
    }
    /**
     * Add files to Git staging area
     */
    async add(cwd, files) {
        await this.runGitCommand(cwd, ['add', ...files]);
    }
    /**
     * Commit changes
     */
    async commit(cwd, message) {
        await this.runGitCommand(cwd, ['commit', '-m', message]);
    }
    /**
     * Check if directory is a Git repository
     */
    isRepository(cwd) {
        return fs.existsSync(path.join(cwd, '.git'));
    }
    /**
     * Get Git configuration value
     */
    async getConfig(key) {
        try {
            const result = await this.runGitCommand(process.cwd(), ['config', '--get', key], true);
            return result.trim() || undefined;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Set Git configuration value
     */
    async setConfig(key, value, global = false) {
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
    async getCurrentBranch(cwd) {
        const result = await this.runGitCommand(cwd, ['branch', '--show-current'], true);
        return result.trim();
    }
    /**
     * Get Git status
     */
    async getStatus(cwd) {
        const result = await this.runGitCommand(cwd, ['status', '--porcelain'], true);
        const lines = result.split('\n').filter(line => line.trim());
        const staged = [];
        const unstaged = [];
        const untracked = [];
        for (const line of lines) {
            const status = line.substring(0, 2);
            const file = line.substring(3);
            if (status[0] !== ' ' && status[0] !== '?') {
                staged.push(file);
            }
            if (status[1] !== ' ') {
                if (status[1] === '?') {
                    untracked.push(file);
                }
                else {
                    unstaged.push(file);
                }
            }
        }
        return { staged, unstaged, untracked };
    }
    /**
     * Check if Git is available
     */
    async isGitAvailable() {
        try {
            await this.runGitCommand(process.cwd(), ['--version']);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get Git version
     */
    async getVersion() {
        try {
            const result = await this.runGitCommand(process.cwd(), ['--version'], true);
            const match = result.match(/git version (.+)/);
            return match ? match[1].trim() : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Clone a repository
     */
    async clone(url, targetPath, options) {
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
    async createBranch(cwd, branchName, checkout = true) {
        const args = ['branch', branchName];
        await this.runGitCommand(cwd, args);
        if (checkout) {
            await this.runGitCommand(cwd, ['checkout', branchName]);
        }
    }
    /**
     * Checkout a branch
     */
    async checkout(cwd, branchName) {
        await this.runGitCommand(cwd, ['checkout', branchName]);
    }
    /**
     * Get list of branches
     */
    async getBranches(cwd, includeRemote = false) {
        const args = ['branch'];
        if (includeRemote) {
            args.push('-a');
        }
        const result = await this.runGitCommand(cwd, args, true);
        const lines = result.split('\n').filter(line => line.trim());
        let current = '';
        const local = [];
        const remote = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ')) {
                current = trimmed.substring(2);
                local.push(current);
            }
            else if (trimmed.startsWith('remotes/')) {
                remote.push(trimmed.substring(8));
            }
            else if (trimmed) {
                local.push(trimmed);
            }
        }
        return { current, local, remote };
    }
    /**
     * Get commit history
     */
    async getCommits(cwd, limit = 10) {
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
    async isWorkingDirectoryClean(cwd) {
        const status = await this.getStatus(cwd);
        return status.staged.length === 0 &&
            status.unstaged.length === 0 &&
            status.untracked.length === 0;
    }
    /**
     * Run a Git command
     */
    async runGitCommand(cwd, args, captureOutput = false) {
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)('git', args, {
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
                }
                else {
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
exports.GitOperations = GitOperations;
//# sourceMappingURL=GitOperations.js.map