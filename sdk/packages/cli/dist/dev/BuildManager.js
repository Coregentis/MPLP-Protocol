"use strict";
/**
 * @fileoverview Build manager implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
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
exports.BuildManager = void 0;
const events_1 = require("events");
const MPLPEventManager_1 = require("../core/MPLPEventManager");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
/**
 * Build manager implementation - 基于MPLP V1.0 Alpha事件架构
 */
class BuildManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this._isBuilding = false;
        this._lastBuildResult = null;
        this.watchMode = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = config;
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Get building status
     */
    get isBuilding() {
        return this._isBuilding;
    }
    /**
     * Get last build result
     */
    get lastBuildResult() {
        return this._lastBuildResult;
    }
    /**
     * Perform build
     */
    async build() {
        if (this._isBuilding) {
            throw new Error('Build already in progress');
        }
        this._isBuilding = true;
        this.emit('build:start');
        const startTime = Date.now();
        try {
            const result = await this.performBuild();
            const duration = Date.now() - startTime;
            const buildResult = {
                ...result,
                duration
            };
            this._lastBuildResult = buildResult;
            this._isBuilding = false;
            this.emit('build:complete', buildResult);
            return buildResult;
        }
        catch (error) {
            this._isBuilding = false;
            this.emit('build:error', error);
            throw error;
        }
    }
    /**
     * Start watch mode
     */
    async watch() {
        if (this.watchMode) {
            return;
        }
        this.watchMode = true;
        this.emit('watch:start');
    }
    /**
     * Stop build manager
     */
    async stop() {
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
    async performBuild() {
        const errors = [];
        const warnings = [];
        const assets = [];
        try {
            // Check if TypeScript project
            const hasTypeScript = await this.hasTypeScript();
            if (hasTypeScript) {
                const tsResult = await this.buildTypeScript();
                errors.push(...tsResult.errors);
                warnings.push(...tsResult.warnings);
                assets.push(...tsResult.assets);
            }
            else {
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
        }
        catch (error) {
            errors.push({
                message: error.message,
                stack: error.stack
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
    async hasTypeScript() {
        const tsconfigPath = path.join(this.config.projectRoot, 'tsconfig.json');
        return await fs.pathExists(tsconfigPath);
    }
    /**
     * Build TypeScript project
     */
    async buildTypeScript() {
        const errors = [];
        const warnings = [];
        const assets = [];
        return new Promise((resolve) => {
            const tscPath = this.findTypeScriptCompiler();
            const args = ['--project', this.config.projectRoot];
            if (this.config.verbose) {
                args.push('--verbose');
            }
            const tsc = (0, child_process_1.spawn)(tscPath, args, {
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
                }
                catch (error) {
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
    async buildJavaScript() {
        const assets = [];
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
    async copyStaticAssets() {
        const assets = [];
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
    findTypeScriptCompiler() {
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
    parseTypeScriptOutput(output) {
        const errors = [];
        const warnings = [];
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.trim() === '')
                continue;
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
                }
                else {
                    warnings.push(diagnostic);
                }
            }
            else if (line.includes('error')) {
                // Generic error
                errors.push({ message: line.trim() });
            }
        }
        return { errors, warnings };
    }
    /**
     * Collect build assets
     */
    async collectAssets(directory) {
        const assets = [];
        if (!await fs.pathExists(directory)) {
            return assets;
        }
        const collectFromDir = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await collectFromDir(fullPath);
                }
                else if (entry.isFile()) {
                    const stats = await fs.stat(fullPath);
                    const ext = path.extname(entry.name);
                    let type = 'other';
                    if (['.js', '.mjs'].includes(ext))
                        type = 'js';
                    else if (['.ts', '.tsx'].includes(ext))
                        type = 'ts';
                    else if (ext === '.json')
                        type = 'json';
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
exports.BuildManager = BuildManager;
//# sourceMappingURL=BuildManager.js.map