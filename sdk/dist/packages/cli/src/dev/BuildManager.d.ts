/**
 * @fileoverview Build manager implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { EventEmitter } from 'events';
import { DevServerConfig, IBuildManager, BuildResult } from './types';
/**
 * Build manager implementation - 基于MPLP V1.0 Alpha事件架构
 */
export declare class BuildManager extends EventEmitter implements IBuildManager {
    private eventManager;
    private readonly config;
    private buildProcess?;
    private _isBuilding;
    private _lastBuildResult;
    private watchMode;
    constructor(config: DevServerConfig);
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * Get building status
     */
    get isBuilding(): boolean;
    /**
     * Get last build result
     */
    get lastBuildResult(): BuildResult | null;
    /**
     * Perform build
     */
    build(): Promise<BuildResult>;
    /**
     * Start watch mode
     */
    watch(): Promise<void>;
    /**
     * Stop build manager
     */
    stop(): Promise<void>;
    /**
     * Perform the actual build
     */
    private performBuild;
    /**
     * Check if project has TypeScript
     */
    private hasTypeScript;
    /**
     * Build TypeScript project
     */
    private buildTypeScript;
    /**
     * Build JavaScript project
     */
    private buildJavaScript;
    /**
     * Copy static assets
     */
    private copyStaticAssets;
    /**
     * Find TypeScript compiler
     */
    private findTypeScriptCompiler;
    /**
     * Parse TypeScript compiler output
     */
    private parseTypeScriptOutput;
    /**
     * Collect build assets
     */
    private collectAssets;
}
//# sourceMappingURL=BuildManager.d.ts.map