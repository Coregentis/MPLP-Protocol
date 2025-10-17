"use strict";
/**
 * @fileoverview Package manager detection and operations
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
exports.PackageManagerDetector = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * Package manager implementation
 */
class PackageManagerImpl {
    constructor(name) {
        this.name = name;
    }
    /**
     * Install packages
     */
    async install(cwd, packages) {
        const args = packages ? ['add', ...packages] : ['install'];
        if (this.name === 'npm') {
            args[0] = packages ? 'install' : 'install';
        }
        await this.run(cwd, args);
    }
    /**
     * Run a script
     */
    async run(cwd, script) {
        const args = Array.isArray(script) ? script : ['run', script];
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(this.name, args, {
                cwd,
                stdio: 'inherit',
                shell: true
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`${this.name} ${args.join(' ')} failed with code ${code}`));
                }
            });
            child.on('error', reject);
        });
    }
    /**
     * Initialize a new package
     */
    async init(cwd) {
        const args = this.name === 'npm' ? ['init', '-y'] : ['init', '-y'];
        await this.run(cwd, args);
    }
}
/**
 * Package manager detector
 */
class PackageManagerDetector {
    /**
     * Detect package manager from project directory
     */
    async detect(projectPath) {
        // Check for lock files
        if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
            return new PackageManagerImpl('pnpm');
        }
        if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
            return new PackageManagerImpl('yarn');
        }
        if (await fs.pathExists(path.join(projectPath, 'package-lock.json'))) {
            return new PackageManagerImpl('npm');
        }
        // Check for package manager in parent directories
        let currentDir = projectPath;
        while (currentDir !== path.dirname(currentDir)) {
            currentDir = path.dirname(currentDir);
            if (await fs.pathExists(path.join(currentDir, 'pnpm-lock.yaml'))) {
                return new PackageManagerImpl('pnpm');
            }
            if (await fs.pathExists(path.join(currentDir, 'yarn.lock'))) {
                return new PackageManagerImpl('yarn');
            }
            if (await fs.pathExists(path.join(currentDir, 'package-lock.json'))) {
                return new PackageManagerImpl('npm');
            }
        }
        // Check for globally installed package managers
        const availableManagers = await this.getAvailablePackageManagers();
        // Prefer pnpm > yarn > npm
        if (availableManagers.includes('pnpm')) {
            return new PackageManagerImpl('pnpm');
        }
        if (availableManagers.includes('yarn')) {
            return new PackageManagerImpl('yarn');
        }
        return new PackageManagerImpl('npm');
    }
    /**
     * Get available package managers
     */
    async getAvailablePackageManagers() {
        const managers = ['pnpm', 'yarn', 'npm'];
        const available = [];
        for (const manager of managers) {
            if (await this.isPackageManagerAvailable(manager)) {
                available.push(manager);
            }
        }
        return available;
    }
    /**
     * Check if package manager is available
     */
    async isPackageManagerAvailable(manager) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(manager, ['--version'], {
                stdio: 'ignore',
                shell: true
            });
            child.on('close', (code) => {
                resolve(code === 0);
            });
            child.on('error', () => {
                resolve(false);
            });
        });
    }
    /**
     * Get package manager version
     */
    async getVersion(manager) {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)(manager, ['--version'], {
                stdio: 'pipe',
                shell: true
            });
            let output = '';
            child.stdout?.on('data', (data) => {
                output += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                }
                else {
                    resolve(null);
                }
            });
            child.on('error', () => {
                resolve(null);
            });
        });
    }
    /**
     * Get recommended package manager for project
     */
    async getRecommended(projectPath) {
        // Check for existing lock files
        if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
            return {
                manager: new PackageManagerImpl('pnpm'),
                reason: 'Found pnpm-lock.yaml'
            };
        }
        if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
            return {
                manager: new PackageManagerImpl('yarn'),
                reason: 'Found yarn.lock'
            };
        }
        if (await fs.pathExists(path.join(projectPath, 'package-lock.json'))) {
            return {
                manager: new PackageManagerImpl('npm'),
                reason: 'Found package-lock.json'
            };
        }
        // Check for workspace configuration
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            if (packageJson.workspaces) {
                return {
                    manager: new PackageManagerImpl('pnpm'),
                    reason: 'Workspace configuration detected (pnpm recommended)'
                };
            }
        }
        // Default recommendation based on availability
        const available = await this.getAvailablePackageManagers();
        if (available.includes('pnpm')) {
            return {
                manager: new PackageManagerImpl('pnpm'),
                reason: 'pnpm is faster and more efficient'
            };
        }
        if (available.includes('yarn')) {
            return {
                manager: new PackageManagerImpl('yarn'),
                reason: 'Yarn provides better dependency resolution'
            };
        }
        return {
            manager: new PackageManagerImpl('npm'),
            reason: 'npm is the default Node.js package manager'
        };
    }
    /**
     * Create package manager instance
     */
    create(name) {
        return new PackageManagerImpl(name);
    }
}
exports.PackageManagerDetector = PackageManagerDetector;
//# sourceMappingURL=PackageManagerDetector.js.map