/**
 * @fileoverview Platform Adapter Registry for managing platform adapters
 * @version 1.1.0-beta
 */
import { IPlatformAdapter, IPlatformAdapterRegistry } from '../types';
/**
 * Registry for managing platform adapters
 */
export declare class PlatformAdapterRegistry implements IPlatformAdapterRegistry {
    private static instance;
    private readonly adapters;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): PlatformAdapterRegistry;
    /**
     * Register a platform adapter
     */
    register(name: string, adapterClass: new () => IPlatformAdapter): void;
    /**
     * Get a platform adapter by name
     */
    get(name: string): (new () => IPlatformAdapter) | undefined;
    /**
     * Check if a platform adapter is registered
     */
    has(name: string): boolean;
    /**
     * Get all registered platform names
     */
    getRegisteredPlatforms(): string[];
    /**
     * Unregister a platform adapter
     */
    unregister(name: string): boolean;
    /**
     * Clear all registered adapters
     */
    clear(): void;
    /**
     * Get the number of registered adapters
     */
    size(): number;
    /**
     * Create a new adapter instance
     */
    createAdapter(name: string): IPlatformAdapter;
    /**
     * Register multiple adapters at once
     */
    registerMultiple(adapters: Record<string, new () => IPlatformAdapter>): void;
    /**
     * Get adapter information
     */
    getAdapterInfo(name: string): {
        name: string;
        registered: boolean;
        className?: string | undefined;
    };
    /**
     * Get all adapter information
     */
    getAllAdapterInfo(): Array<{
        name: string;
        className: string;
    }>;
    /**
     * Validate that an object implements the IPlatformAdapter interface
     */
    private _validateAdapterInterface;
    /**
     * Create a new registry instance (for testing)
     */
    static createInstance(): PlatformAdapterRegistry;
}
//# sourceMappingURL=PlatformAdapterRegistry.d.ts.map