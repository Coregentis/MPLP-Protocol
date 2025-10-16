/**
 * @fileoverview Package manager detection and operations
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { PackageManager } from '../core/types';

/**
 * Package manager implementation
 */
class PackageManagerImpl implements PackageManager {
  constructor(public readonly name: 'npm' | 'yarn' | 'pnpm') {}

  /**
   * Install packages
   */
  public async install(cwd: string, packages?: string[]): Promise<void> {
    const args = packages ? ['add', ...packages] : ['install'];
    
    if (this.name === 'npm') {
      args[0] = packages ? 'install' : 'install';
    }

    await this.run(cwd, args);
  }

  /**
   * Run a script
   */
  public async run(cwd: string, script: string | string[]): Promise<void> {
    const args = Array.isArray(script) ? script : ['run', script];
    
    return new Promise((resolve, reject) => {
      const child = spawn(this.name, args, {
        cwd,
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${this.name} ${args.join(' ')} failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Initialize a new package
   */
  public async init(cwd: string): Promise<void> {
    const args = this.name === 'npm' ? ['init', '-y'] : ['init', '-y'];
    await this.run(cwd, args);
  }
}

/**
 * Package manager detector
 */
export class PackageManagerDetector {
  /**
   * Detect package manager from project directory
   */
  public async detect(projectPath: string): Promise<PackageManager> {
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
  private async getAvailablePackageManagers(): Promise<string[]> {
    const managers = ['pnpm', 'yarn', 'npm'];
    const available: string[] = [];

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
  private async isPackageManagerAvailable(manager: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn(manager, ['--version'], {
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
  public async getVersion(manager: 'npm' | 'yarn' | 'pnpm'): Promise<string | null> {
    return new Promise((resolve) => {
      const child = spawn(manager, ['--version'], {
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
        } else {
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
  public async getRecommended(projectPath: string): Promise<{
    manager: PackageManager;
    reason: string;
  }> {
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
  public create(name: 'npm' | 'yarn' | 'pnpm'): PackageManager {
    return new PackageManagerImpl(name);
  }
}
