"use strict";
/**
 * @fileoverview Platform Adapter Registry for managing platform adapters
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdapterRegistry = void 0;
const errors_1 = require("../types/errors");
/**
 * Registry for managing platform adapters
 */
class PlatformAdapterRegistry {
    constructor() {
        this.adapters = new Map();
        // Private constructor for singleton pattern
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!PlatformAdapterRegistry.instance) {
            PlatformAdapterRegistry.instance = new PlatformAdapterRegistry();
        }
        return PlatformAdapterRegistry.instance;
    }
    /**
     * Register a platform adapter
     */
    register(name, adapterClass) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new errors_1.PlatformAdapterRegistrationError('Platform name must be a non-empty string');
        }
        if (!adapterClass || typeof adapterClass !== 'function') {
            throw new errors_1.PlatformAdapterRegistrationError('Adapter class must be a constructor function');
        }
        const normalizedName = name.toLowerCase().trim();
        // Check if adapter is already registered
        if (this.adapters.has(normalizedName)) {
            throw new errors_1.PlatformAdapterRegistrationError(`Platform adapter '${name}' is already registered`);
        }
        // Validate adapter class by creating a test instance
        try {
            const testInstance = new adapterClass();
            // Check if instance implements required interface
            if (!this._validateAdapterInterface(testInstance)) {
                throw new errors_1.PlatformAdapterRegistrationError(`Adapter class for '${name}' does not implement IPlatformAdapter interface correctly`);
            }
            // Cleanup test instance
            if (typeof testInstance.destroy === 'function') {
                void testInstance.destroy().catch(() => {
                    // Ignore cleanup errors
                });
            }
        }
        catch (error) {
            if (error instanceof errors_1.PlatformAdapterRegistrationError) {
                throw error;
            }
            throw new errors_1.PlatformAdapterRegistrationError(`Failed to validate adapter class for '${name}': ${error instanceof Error ? error.message : String(error)}`);
        }
        this.adapters.set(normalizedName, adapterClass);
    }
    /**
     * Get a platform adapter by name
     */
    get(name) {
        if (!name || typeof name !== 'string') {
            return undefined;
        }
        const normalizedName = name.toLowerCase().trim();
        return this.adapters.get(normalizedName);
    }
    /**
     * Check if a platform adapter is registered
     */
    has(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        const normalizedName = name.toLowerCase().trim();
        return this.adapters.has(normalizedName);
    }
    /**
     * Get all registered platform names
     */
    getRegisteredPlatforms() {
        return Array.from(this.adapters.keys());
    }
    /**
     * Unregister a platform adapter
     */
    unregister(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        const normalizedName = name.toLowerCase().trim();
        return this.adapters.delete(normalizedName);
    }
    /**
     * Clear all registered adapters
     */
    clear() {
        this.adapters.clear();
    }
    /**
     * Get the number of registered adapters
     */
    size() {
        return this.adapters.size;
    }
    /**
     * Create a new adapter instance
     */
    createAdapter(name) {
        const AdapterClass = this.get(name);
        if (!AdapterClass) {
            throw new errors_1.PlatformAdapterNotFoundError(name);
        }
        try {
            return new AdapterClass();
        }
        catch (error) {
            throw new errors_1.PlatformAdapterRegistrationError(`Failed to create adapter instance for '${name}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Register multiple adapters at once
     */
    registerMultiple(adapters) {
        const errors = [];
        const successfulRegistrations = [];
        for (const [name, adapterClass] of Object.entries(adapters)) {
            try {
                this.register(name, adapterClass);
                successfulRegistrations.push(name);
            }
            catch (error) {
                errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
                // Rollback successful registrations
                for (const successfulName of successfulRegistrations) {
                    this.unregister(successfulName);
                }
                break; // Stop on first error
            }
        }
        if (errors.length > 0) {
            throw new errors_1.PlatformAdapterRegistrationError(`Failed to register some adapters:\n${errors.join('\n')}`);
        }
    }
    /**
     * Get adapter information
     */
    getAdapterInfo(name) {
        const normalizedName = name.toLowerCase().trim();
        const AdapterClass = this.adapters.get(normalizedName);
        return {
            name: normalizedName,
            registered: !!AdapterClass,
            className: AdapterClass?.name
        };
    }
    /**
     * Get all adapter information
     */
    getAllAdapterInfo() {
        return Array.from(this.adapters.entries()).map(([name, AdapterClass]) => ({
            name,
            className: AdapterClass.name
        }));
    }
    /**
     * Validate that an object implements the IPlatformAdapter interface
     */
    _validateAdapterInterface(adapter) {
        if (!adapter || typeof adapter !== 'object') {
            return false;
        }
        const requiredProperties = ['name', 'version', 'status'];
        const requiredMethods = [
            'initialize', 'connect', 'disconnect', 'sendMessage',
            'getStatus', 'destroy', 'on', 'emit', 'removeListener'
        ];
        // Check required properties
        for (const prop of requiredProperties) {
            if (!(prop in adapter)) {
                return false;
            }
        }
        // Check required methods
        for (const method of requiredMethods) {
            if (!(method in adapter) || typeof adapter[method] !== 'function') {
                return false;
            }
        }
        return true;
    }
    /**
     * Create a new registry instance (for testing)
     */
    static createInstance() {
        return new PlatformAdapterRegistry();
    }
}
exports.PlatformAdapterRegistry = PlatformAdapterRegistry;
//# sourceMappingURL=PlatformAdapterRegistry.js.map