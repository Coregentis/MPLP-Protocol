import { EventBus } from '../events/EventBus';
import { Logger } from '../logging/Logger';
import { BaseModule } from './BaseModule';
/**
 * Module dependency information
 */
export interface ModuleDependency {
    name: string;
    version?: string;
    optional?: boolean;
}
/**
 * Module metadata
 */
export interface ModuleMetadata {
    name: string;
    version: string;
    description?: string;
    dependencies?: ModuleDependency[];
    tags?: string[];
    author?: string;
    license?: string;
}
/**
 * Module registration options
 */
export interface ModuleRegistrationOptions {
    autoStart?: boolean;
    priority?: number;
    metadata?: ModuleMetadata;
    config?: Record<string, any>;
}
/**
 * Module status information
 */
export interface ModuleStatus {
    name: string;
    status: 'registered' | 'initialized' | 'started' | 'stopped' | 'error';
    version?: string;
    uptime?: number;
    lastError?: string;
    dependencies?: string[];
    dependents?: string[];
    metadata?: ModuleMetadata;
}
/**
 * Module health information
 */
export interface ModuleHealth {
    name: string;
    healthy: boolean;
    lastCheck: Date;
    checkDuration: number;
    error?: string;
    metrics?: Record<string, any>;
}
/**
 * Enhanced Module Manager
 *
 * Advanced module management system with dependency resolution,
 * dynamic loading/unloading, health monitoring, and lifecycle control.
 */
export declare class ModuleManager {
    private modules;
    private moduleOptions;
    private moduleStartTimes;
    private moduleDependencies;
    private moduleDependents;
    private eventBus;
    private logger;
    private initialized;
    private startupOrder;
    constructor(eventBus: EventBus, logger: Logger);
    /**
     * Initializes the module manager
     */
    initialize(): Promise<void>;
    /**
     * Registers a module with the manager
     *
     * @param name - Module name
     * @param module - Module instance
     * @param options - Registration options
     */
    registerModule<T extends BaseModule>(name: string, module: T, options?: ModuleRegistrationOptions): Promise<void>;
    /**
     * Validates module dependencies
     */
    private validateDependencies;
    /**
     * Builds dependency graph for a module
     */
    private buildDependencyGraph;
    /**
     * Cleans up dependency graph for a module
     */
    private cleanupDependencyGraph;
    /**
     * Checks if version is compatible (simple semantic versioning)
     */
    private isVersionCompatible;
    /**
     * Calculates the startup order based on dependencies (topological sort)
     */
    private calculateStartupOrder;
    /**
     * Gets a registered module by name
     *
     * @param name - Module name
     * @returns Module instance or undefined if not found
     */
    getModule<T extends BaseModule>(name: string): T | undefined;
    /**
     * Gets all registered modules
     */
    getModules(): Map<string, BaseModule>;
    /**
     * Starts a specific module and its dependencies
     */
    startModule(name: string): Promise<void>;
    /**
     * Stops a specific module and its dependents
     */
    stopModule(name: string): Promise<void>;
    /**
     * Starts all registered modules in dependency order
     */
    startAll(): Promise<void>;
    /**
     * Stops all registered modules in reverse dependency order
     */
    stopAll(): Promise<void>;
    /**
     * Unregisters a module
     *
     * @param name - Module name
     */
    unregisterModule(name: string): Promise<void>;
    /**
     * Gets detailed status of all modules
     */
    getModuleStatuses(): Record<string, ModuleStatus>;
    /**
     * Gets the status of a specific module
     */
    getModuleStatus(name: string): ModuleStatus | undefined;
    /**
     * Gets detailed health information for all modules
     */
    getModuleHealthInfo(): Promise<Record<string, ModuleHealth>>;
    /**
     * Checks if all modules are healthy
     */
    areAllModulesHealthy(): Promise<boolean>;
    /**
     * Gets health information for a specific module
     */
    getModuleHealth(name: string): Promise<ModuleHealth | undefined>;
    /**
     * Gets module dependency graph
     */
    getDependencyGraph(): Record<string, string[]>;
    /**
     * Gets modules that depend on a specific module
     */
    getModuleDependents(name: string): string[];
    /**
     * Gets dependencies of a specific module
     */
    getModuleDependencies(name: string): string[];
}
//# sourceMappingURL=ModuleManager.d.ts.map