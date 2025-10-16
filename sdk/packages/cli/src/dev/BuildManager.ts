/**
 * @fileoverview Build manager implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { EventEmitter } from 'events';
import { MPLPEventManager } from '../core/MPLPEventManager';
import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn, ChildProcess } from 'child_process';
import { DevServerConfig, IBuildManager, BuildResult, BuildError, BuildWarning, BuildAsset } from './types';

/**
 * Build manager implementation - 基于MPLP V1.0 Alpha事件架构
 */
export class BuildManager extends EventEmitter implements IBuildManager {
  private eventManager: MPLPEventManager;
  private readonly config: DevServerConfig;
  private buildProcess?: ChildProcess;
  private _isBuilding = false;
  private _lastBuildResult: BuildResult | null = null;
  private watchMode = false;

  constructor(config: DevServerConfig) {
    super();
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Get building status
   */
  public get isBuilding(): boolean {
    return this._isBuilding;
  }

  /**
   * Get last build result
   */
  public get lastBuildResult(): BuildResult | null {
    return this._lastBuildResult;
  }

  /**
   * Perform build
   */
  public async build(): Promise<BuildResult> {
    if (this._isBuilding) {
      throw new Error('Build already in progress');
    }

    this._isBuilding = true;
    this.emit('build:start');

    const startTime = Date.now();

    try {
      const result = await this.performBuild();
      const duration = Date.now() - startTime;
      
      const buildResult: BuildResult = {
        ...result,
        duration
      };

      this._lastBuildResult = buildResult;
      this._isBuilding = false;
      
      this.emit('build:complete', buildResult);
      return buildResult;
      
    } catch (error) {
      this._isBuilding = false;
      this.emit('build:error', error);
      throw error;
    }
  }

  /**
   * Start watch mode
   */
  public async watch(): Promise<void> {
    if (this.watchMode) {
      return;
    }

    this.watchMode = true;
    this.emit('watch:start');
  }

  /**
   * Stop build manager
   */
  public async stop(): Promise<void> {
    if (this.buildProcess) {
      this.buildProcess.kill();
      this.buildProcess = undefined;
    }

    this.watchMode = false;
    this._isBuilding = false;
    this.emit('build:stop');
  }

  /**
   * Perform the actual build
   */
  private async performBuild(): Promise<Omit<BuildResult, 'duration'>> {
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];
    const assets: BuildAsset[] = [];

    try {
      // Check if TypeScript project
      const hasTypeScript = await this.hasTypeScript();
      
      if (hasTypeScript) {
        const tsResult = await this.buildTypeScript();
        errors.push(...tsResult.errors);
        warnings.push(...tsResult.warnings);
        assets.push(...tsResult.assets);
      } else {
        // For JavaScript projects, just copy files
        const jsResult = await this.buildJavaScript();
        assets.push(...jsResult.assets);
      }

      // Copy static assets
      const staticAssets = await this.copyStaticAssets();
      assets.push(...staticAssets);

      return {
        success: errors.length === 0,
        errors,
        warnings,
        assets
      };

    } catch (error) {
      errors.push({
        message: (error as Error).message,
        stack: (error as Error).stack
      });

      return {
        success: false,
        errors,
        warnings,
        assets
      };
    }
  }

  /**
   * Check if project has TypeScript
   */
  private async hasTypeScript(): Promise<boolean> {
    const tsconfigPath = path.join(this.config.projectRoot, 'tsconfig.json');
    return await fs.pathExists(tsconfigPath);
  }

  /**
   * Build TypeScript project
   */
  private async buildTypeScript(): Promise<{
    errors: BuildError[];
    warnings: BuildWarning[];
    assets: BuildAsset[];
  }> {
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];
    const assets: BuildAsset[] = [];

    return new Promise((resolve) => {
      const tscPath = this.findTypeScriptCompiler();
      const args = ['--project', this.config.projectRoot];
      
      if (this.config.verbose) {
        args.push('--verbose');
      }

      const tsc = spawn(tscPath, args, {
        cwd: this.config.projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      tsc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      tsc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      tsc.on('close', async (code) => {
        // Parse TypeScript output
        if (stderr) {
          const tsErrors = this.parseTypeScriptOutput(stderr);
          errors.push(...tsErrors.errors);
          warnings.push(...tsErrors.warnings);
        }

        // Collect built assets
        try {
          const builtAssets = await this.collectAssets(this.config.distDir);
          assets.push(...builtAssets);
        } catch (error) {
          // Ignore asset collection errors
        }

        resolve({ errors, warnings, assets });
      });

      tsc.on('error', (error) => {
        errors.push({
          message: `TypeScript compiler error: ${error.message}`,
          stack: error.stack
        });
        resolve({ errors, warnings, assets });
      });
    });
  }

  /**
   * Build JavaScript project
   */
  private async buildJavaScript(): Promise<{
    assets: BuildAsset[];
  }> {
    const assets: BuildAsset[] = [];

    // Copy JavaScript files from src to dist
    const srcDir = this.config.srcDir;
    const distDir = this.config.distDir;

    if (await fs.pathExists(srcDir)) {
      await fs.ensureDir(distDir);
      await fs.copy(srcDir, distDir, {
        filter: (src) => {
          const ext = path.extname(src);
          return ['.js', '.json'].includes(ext) || fs.statSync(src).isDirectory();
        }
      });

      // Collect copied assets
      const copiedAssets = await this.collectAssets(distDir);
      assets.push(...copiedAssets);
    }

    return { assets };
  }

  /**
   * Copy static assets
   */
  private async copyStaticAssets(): Promise<BuildAsset[]> {
    const assets: BuildAsset[] = [];
    const publicDir = this.config.publicDir;
    const distDir = this.config.distDir;

    if (await fs.pathExists(publicDir)) {
      const publicDistDir = path.join(distDir, 'public');
      await fs.ensureDir(publicDistDir);
      await fs.copy(publicDir, publicDistDir);

      // Collect static assets
      const staticAssets = await this.collectAssets(publicDistDir);
      assets.push(...staticAssets);
    }

    return assets;
  }

  /**
   * Find TypeScript compiler
   */
  private findTypeScriptCompiler(): string {
    // Try local installation first
    const localTsc = path.join(this.config.projectRoot, 'node_modules', '.bin', 'tsc');
    if (fs.existsSync(localTsc)) {
      return localTsc;
    }

    // Fall back to global installation
    return 'tsc';
  }

  /**
   * Parse TypeScript compiler output
   */
  private parseTypeScriptOutput(output: string): {
    errors: BuildError[];
    warnings: BuildWarning[];
  } {
    const errors: BuildError[] = [];
    const warnings: BuildWarning[] = [];

    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;

      // Parse TypeScript diagnostic format: file(line,col): error TS####: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS\d+:\s+(.+)$/);
      
      if (match) {
        const [, file, lineStr, colStr, level, message] = match;
        const diagnostic = {
          message,
          file: path.relative(this.config.projectRoot, file),
          line: parseInt(lineStr, 10),
          column: parseInt(colStr, 10)
        };

        if (level === 'error') {
          errors.push(diagnostic);
        } else {
          warnings.push(diagnostic);
        }
      } else if (line.includes('error')) {
        // Generic error
        errors.push({ message: line.trim() });
      }
    }

    return { errors, warnings };
  }

  /**
   * Collect build assets
   */
  private async collectAssets(directory: string): Promise<BuildAsset[]> {
    const assets: BuildAsset[] = [];

    if (!await fs.pathExists(directory)) {
      return assets;
    }

    const collectFromDir = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await collectFromDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          const ext = path.extname(entry.name);
          
          let type: BuildAsset['type'] = 'other';
          if (['.js', '.mjs'].includes(ext)) type = 'js';
          else if (['.ts', '.tsx'].includes(ext)) type = 'ts';
          else if (ext === '.json') type = 'json';

          assets.push({
            name: entry.name,
            size: stats.size,
            type,
            path: path.relative(this.config.projectRoot, fullPath)
          });
        }
      }
    };

    await collectFromDir(directory);
    return assets;
  }
}
