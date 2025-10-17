"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = void 0;
const ModuleError_1 = require("../errors/ModuleError");
/**
 * Enhanced Module Manager
 *
 * Advanced module management system with dependency resolution,
 * dynamic loading/unloading, health monitoring, and lifecycle control.
 */
class ModuleManager {
    constructor(eventBus, logger) {
        this.modules = new Map();
        this.moduleOptions = new Map();
        this.moduleStartTimes = new Map();
        this.moduleDependencies = new Map();
        this.moduleDependents = new Map();
        this.initialized = false;
        this.startupOrder = [];
        this.eventBus = eventBus;
        this.logger = logger;
    }
    /**
     * Initializes the module manager
     */
    async initialize() {
        if (this.initialized) {
            throw new ModuleError_1.ModuleError('ModuleManager is already initialized');
        }
        this.logger.info('Initializing ModuleManager...');
        this.initialized = true;
        this.logger.info('ModuleManager initialized successfully');
    }
    /**
     * Registers a module with the manager
     *
     * @param name - Module name
     * @param module - Module instance
     * @param options - Registration options
     */
    async registerModule(name, module, options = {}) {
        if (!this.initialized) {
            throw new ModuleError_1.ModuleError('ModuleManager must be initialized before registering modules');
        }
        if (this.modules.has(name)) {
            throw new ModuleError_1.ModuleError(`Module '${name}' is already registered`);
        }
        this.logger.info(`Registering module: ${name}`, { options });
        // Validate dependencies
        if (options.metadata?.dependencies) {
            await this.validateDependencies(name, options.metadata.dependencies);
        }
        // Store module and options
        this.modules.set(name, module);
        this.moduleOptions.set(name, options);
        // Build dependency graph
        this.buildDependencyGraph(name, options.metadata?.dependencies || []);
        // Initialize the module
        try {
            await module.initialize();
            this.logger.debug(`Module '${name}' initialized successfully`);
        }
        catch (error) {
            // Cleanup on initialization failure
            this.modules.delete(name);
            this.moduleOptions.delete(name);
            this.cleanupDependencyGraph(name);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ModuleError_1.ModuleError(`Failed to initialize module '${name}': ${errorMessage}`, errorCause);
        }
        // Auto-start if requested
        if (options.autoStart) {
            try {
                await this.startModule(name);
            }
            catch (error) {
                this.logger.warn(`Failed to auto-start module '${name}':`, error);
            }
        }
        this.eventBus.emit('moduleRegistered', { name, module, options });
        this.logger.info(`Module '${name}' registered successfully`);
    }
    /**
     * Validates module dependencies
     */
    async validateDependencies(moduleName, dependencies) {
        for (const dep of dependencies) {
            if (!dep.optional && !this.modules.has(dep.name)) {
                throw new ModuleError_1.ModuleError(`Module '${moduleName}' requires dependency '${dep.name}' which is not registered`);
            }
            if (dep.version && this.modules.has(dep.name)) {
                const depModule = this.modules.get(dep.name);
                const depOptions = this.moduleOptions.get(dep.name);
                const depVersion = depOptions?.metadata?.version;
                if (depVersion && !this.isVersionCompatible(depVersion, dep.version)) {
                    throw new ModuleError_1.ModuleError(`Module '${moduleName}' requires '${dep.name}' version ${dep.version}, but version ${depVersion} is registered`);
                }
            }
        }
    }
    /**
     * Builds dependency graph for a module
     */
    buildDependencyGraph(moduleName, dependencies) {
        const depNames = dependencies.map(dep => dep.name);
        this.moduleDependencies.set(moduleName, depNames);
        // Update dependents
        for (const depName of depNames) {
            if (!this.moduleDependents.has(depName)) {
                this.moduleDependents.set(depName, []);
            }
            this.moduleDependents.get(depName).push(moduleName);
        }
    }
    /**
     * Cleans up dependency graph for a module
     */
    cleanupDependencyGraph(moduleName) {
        const dependencies = this.moduleDependencies.get(moduleName) || [];
        // Remove from dependents
        for (const depName of dependencies) {
            const dependents = this.moduleDependents.get(depName) || [];
            const index = dependents.indexOf(moduleName);
            if (index > -1) {
                dependents.splice(index, 1);
            }
        }
        this.moduleDependencies.delete(moduleName);
    }
    /**
     * Checks if version is compatible (simple semantic versioning)
     */
    isVersionCompatible(available, required) {
        // Simple version compatibility check
        // In a real implementation, you'd use a proper semver library
        const availableParts = available.split('.').map(Number);
        const requiredParts = required.split('.').map(Number);
        // Major version must match
        if (availableParts[0] !== requiredParts[0]) {
            return false;
        }
        // Minor version must be >= required
        if (availableParts[1] < requiredParts[1]) {
            return false;
        }
        // Patch version must be >= required if minor versions are equal
        if (availableParts[1] === requiredParts[1] && availableParts[2] < requiredParts[2]) {
            return false;
        }
        return true;
    }
    /**
     * Calculates the startup order based on dependencies (topological sort)
     */
    calculateStartupOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];
        const visit = (moduleName) => {
            if (visited.has(moduleName)) {
                return;
            }
            if (visiting.has(moduleName)) {
                throw new ModuleError_1.ModuleError(`Circular dependency detected involving module '${moduleName}'`);
            }
            visiting.add(moduleName);
            // Visit dependencies first
            const dependencies = this.moduleDependencies.get(moduleName) || [];
            for (const depName of dependencies) {
                if (this.modules.has(depName)) {
                    visit(depName);
                }
            }
            visiting.delete(moduleName);
            visited.add(moduleName);
            order.push(moduleName);
        };
        // Visit all modules
        for (const moduleName of this.modules.keys()) {
            visit(moduleName);
        }
        return order;
    }
    /**
     * Gets a registered module by name
     *
     * @param name - Module name
     * @returns Module instance or undefined if not found
     */
    getModule(name) {
        return this.modules.get(name);
    }
    /**
     * Gets all registered modules
     */
    getModules() {
        return new Map(this.modules);
    }
    /**
     * Starts a specific module and its dependencies
     */
    async startModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            throw new ModuleError_1.ModuleError(`Module '${name}' is not registered`);
        }
        if (module.isStarted()) {
            this.logger.debug(`Module '${name}' is already started`);
            return;
        }
        // Start dependencies first
        const dependencies = this.moduleDependencies.get(name) || [];
        for (const depName of dependencies) {
            if (this.modules.has(depName)) {
                await this.startModule(depName);
            }
        }
        this.logger.info(`Starting module: ${name}`);
        try {
            await module.start();
            this.moduleStartTimes.set(name, new Date());
            this.eventBus.emit('moduleStarted', { name, module });
            this.logger.info(`Module '${name}' started successfully`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorCause = error instanceof Error ? error : undefined;
            throw new ModuleError_1.ModuleError(`Failed to start module '${name}': ${errorMessage}`, errorCause);
        }
    }
    /**
     * Stops a specific module and its dependents
     */
    async stopModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            throw new ModuleError_1.ModuleError(`Module '${name}' is not registered`);
        }
        if (!module.isStarted()) {
            this.logger.debug(`Module '${name}' is not started`);
            return;
        }
        // Stop dependents first
        const dependents = this.moduleDependents.get(name) || [];
        for (const depName of dependents) {
            if (this.modules.has(depName)) {
                await this.stopModule(depName);
            }
        }
        this.logger.info(`Stopping module: ${name}`);
        try {
            await module.stop();
            this.moduleStartTimes.delete(name);
            this.eventBus.emit('moduleStopped', { name, module });
            this.logger.info(`Module '${name}' stopped successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to stop module '${name}':`, error);
            // Don't throw here, we want to continue with cleanup
        }
    }
    /**
     * Starts all registered modules in dependency order
     */
    async startAll() {
        this.logger.info('Starting all modules...');
        const startOrder = this.calculateStartupOrder();
        this.startupOrder = startOrder;
        for (const name of startOrder) {
            const module = this.modules.get(name);
            if (module && !module.isStarted()) {
                try {
                    this.logger.debug(`Starting module: ${name}`);
                    await module.start();
                    this.moduleStartTimes.set(name, new Date());
                    this.eventBus.emit('moduleStarted', { name, module });
                    this.logger.debug(`Module '${name}' started successfully`);
                }
                catch (error) {
                    this.logger.error(`Failed to start module '${name}':`, error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    const errorCause = error instanceof Error ? error : undefined;
                    throw new ModuleError_1.ModuleError(`Failed to start module '${name}': ${errorMessage}`, errorCause);
                }
            }
        }
        this.logger.info('All modules started successfully');
    }
    /**
     * Stops all registered modules in reverse dependency order
     */
    async stopAll() {
        this.logger.info('Stopping all modules...');
        // Stop in reverse order of startup
        const stopOrder = [...this.startupOrder].reverse();
        for (const name of stopOrder) {
            const module = this.modules.get(name);
            if (module && module.isStarted()) {
                try {
                    this.logger.debug(`Stopping module: ${name}`);
                    await module.stop();
                    this.moduleStartTimes.delete(name);
                    this.eventBus.emit('moduleStopped', { name, module });
                    this.logger.debug(`Module '${name}' stopped successfully`);
                }
                catch (error) {
                    this.logger.error(`Failed to stop module '${name}':`, error);
                    // Don't throw here, we want to try to stop all modules
                }
            }
        }
        this.logger.info('All modules stopped');
    }
    /**
     * Unregisters a module
     *
     * @param name - Module name
     */
    async unregisterModule(name) {
        const module = this.modules.get(name);
        if (!module) {
            throw new ModuleError_1.ModuleError(`Module '${name}' is not registered`);
        }
        this.logger.info(`Unregistering module: ${name}`);
        try {
            await module.stop();
        }
        catch (error) {
            this.logger.warn(`Error stopping module '${name}' during unregistration:`, error);
        }
        this.modules.delete(name);
        this.eventBus.emit('moduleUnregistered', { name, module });
        this.logger.info(`Module '${name}' unregistered successfully`);
    }
    /**
     * Gets detailed status of all modules
     */
    getModuleStatuses() {
        const statuses = {};
        for (const [name, module] of this.modules) {
            const options = this.moduleOptions.get(name);
            const startTime = this.moduleStartTimes.get(name);
            const dependencies = this.moduleDependencies.get(name) || [];
            const dependents = this.moduleDependents.get(name) || [];
            statuses[name] = {
                name,
                status: module.getStatus(),
                version: options?.metadata?.version,
                uptime: startTime ? Date.now() - startTime.getTime() : undefined,
                dependencies,
                dependents,
                metadata: options?.metadata,
            };
        }
        return statuses;
    }
    /**
     * Gets the status of a specific module
     */
    getModuleStatus(name) {
        const module = this.modules.get(name);
        if (!module) {
            return undefined;
        }
        const options = this.moduleOptions.get(name);
        const startTime = this.moduleStartTimes.get(name);
        const dependencies = this.moduleDependencies.get(name) || [];
        const dependents = this.moduleDependents.get(name) || [];
        return {
            name,
            status: module.getStatus(),
            version: options?.metadata?.version,
            uptime: startTime ? Date.now() - startTime.getTime() : undefined,
            dependencies,
            dependents,
            metadata: options?.metadata,
        };
    }
    /**
     * Gets detailed health information for all modules
     */
    async getModuleHealthInfo() {
        const healthInfo = {};
        const healthChecks = Array.from(this.modules.entries()).map(async ([name, module]) => {
            const startTime = Date.now();
            let healthy = false;
            let error;
            try {
                healthy = await module.isHealthy();
            }
            catch (err) {
                healthy = false;
                error = err instanceof Error ? err.message : String(err);
            }
            const checkDuration = Date.now() - startTime;
            healthInfo[name] = {
                name,
                healthy,
                lastCheck: new Date(),
                checkDuration,
                error,
            };
        });
        await Promise.all(healthChecks);
        return healthInfo;
    }
    /**
     * Checks if all modules are healthy
     */
    async areAllModulesHealthy() {
        const healthInfo = await this.getModuleHealthInfo();
        return Object.values(healthInfo).every(info => info.healthy);
    }
    /**
     * Gets health information for a specific module
     */
    async getModuleHealth(name) {
        const module = this.modules.get(name);
        if (!module) {
            return undefined;
        }
        const startTime = Date.now();
        let healthy = false;
        let error;
        try {
            healthy = await module.isHealthy();
        }
        catch (err) {
            healthy = false;
            error = err instanceof Error ? err.message : String(err);
        }
        const checkDuration = Date.now() - startTime;
        return {
            name,
            healthy,
            lastCheck: new Date(),
            checkDuration,
            error,
        };
    }
    /**
     * Gets module dependency graph
     */
    getDependencyGraph() {
        const graph = {};
        for (const [name, dependencies] of this.moduleDependencies) {
            graph[name] = [...dependencies];
        }
        return graph;
    }
    /**
     * Gets modules that depend on a specific module
     */
    getModuleDependents(name) {
        return [...(this.moduleDependents.get(name) || [])];
    }
    /**
     * Gets dependencies of a specific module
     */
    getModuleDependencies(name) {
        return [...(this.moduleDependencies.get(name) || [])];
    }
}
exports.ModuleManager = ModuleManager;
//# sourceMappingURL=ModuleManager.js.map