/**
 * @fileoverview Platform Adapter Registry for managing platform adapters
 * @version 1.1.0-beta
 */

import { IPlatformAdapter, IPlatformAdapterRegistry } from '../types';
import { 
  PlatformAdapterRegistrationError, 
  PlatformAdapterNotFoundError 
} from '../types/errors';

/**
 * Registry for managing platform adapters
 */
export class PlatformAdapterRegistry implements IPlatformAdapterRegistry {
  private static instance: PlatformAdapterRegistry;
  private readonly adapters: Map<string, new () => IPlatformAdapter> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PlatformAdapterRegistry {
    if (!PlatformAdapterRegistry.instance) {
      PlatformAdapterRegistry.instance = new PlatformAdapterRegistry();
    }
    return PlatformAdapterRegistry.instance;
  }

  /**
   * Register a platform adapter
   */
  public register(name: string, adapterClass: new () => IPlatformAdapter): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new PlatformAdapterRegistrationError('Platform name must be a non-empty string');
    }

    if (!adapterClass || typeof adapterClass !== 'function') {
      throw new PlatformAdapterRegistrationError('Adapter class must be a constructor function');
    }

    const normalizedName = name.toLowerCase().trim();

    // Check if adapter is already registered
    if (this.adapters.has(normalizedName)) {
      throw new PlatformAdapterRegistrationError(
        `Platform adapter '${name}' is already registered`
      );
    }

    // Validate adapter class by creating a test instance
    try {
      const testInstance = new adapterClass();
      
      // Check if instance implements required interface
      if (!this._validateAdapterInterface(testInstance)) {
        throw new PlatformAdapterRegistrationError(
          `Adapter class for '${name}' does not implement IPlatformAdapter interface correctly`
        );
      }

      // Cleanup test instance
      if (typeof testInstance.destroy === 'function') {
        void testInstance.destroy().catch(() => {
          // Ignore cleanup errors
        });
      }

    } catch (error) {
      if (error instanceof PlatformAdapterRegistrationError) {
        throw error;
      }
      throw new PlatformAdapterRegistrationError(
        `Failed to validate adapter class for '${name}': ${error instanceof Error ? error.message : String(error)}`
      );
    }

    this.adapters.set(normalizedName, adapterClass);
  }

  /**
   * Get a platform adapter by name
   */
  public get(name: string): (new () => IPlatformAdapter) | undefined {
    if (!name || typeof name !== 'string') {
      return undefined;
    }

    const normalizedName = name.toLowerCase().trim();
    return this.adapters.get(normalizedName);
  }

  /**
   * Check if a platform adapter is registered
   */
  public has(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const normalizedName = name.toLowerCase().trim();
    return this.adapters.has(normalizedName);
  }

  /**
   * Get all registered platform names
   */
  public getRegisteredPlatforms(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Unregister a platform adapter
   */
  public unregister(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const normalizedName = name.toLowerCase().trim();
    return this.adapters.delete(normalizedName);
  }

  /**
   * Clear all registered adapters
   */
  public clear(): void {
    this.adapters.clear();
  }

  /**
   * Get the number of registered adapters
   */
  public size(): number {
    return this.adapters.size;
  }

  /**
   * Create a new adapter instance
   */
  public createAdapter(name: string): IPlatformAdapter {
    const AdapterClass = this.get(name);
    if (!AdapterClass) {
      throw new PlatformAdapterNotFoundError(name);
    }

    try {
      return new AdapterClass();
    } catch (error) {
      throw new PlatformAdapterRegistrationError(
        `Failed to create adapter instance for '${name}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Register multiple adapters at once
   */
  public registerMultiple(adapters: Record<string, new () => IPlatformAdapter>): void {
    const errors: string[] = [];
    const successfulRegistrations: string[] = [];

    for (const [name, adapterClass] of Object.entries(adapters)) {
      try {
        this.register(name, adapterClass);
        successfulRegistrations.push(name);
      } catch (error) {
        errors.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
        // Rollback successful registrations
        for (const successfulName of successfulRegistrations) {
          this.unregister(successfulName);
        }
        break; // Stop on first error
      }
    }

    if (errors.length > 0) {
      throw new PlatformAdapterRegistrationError(
        `Failed to register some adapters:\n${errors.join('\n')}`
      );
    }
  }

  /**
   * Get adapter information
   */
  public getAdapterInfo(name: string): { name: string; registered: boolean; className?: string | undefined } {
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
  public getAllAdapterInfo(): Array<{ name: string; className: string }> {
    return Array.from(this.adapters.entries()).map(([name, AdapterClass]) => ({
      name,
      className: AdapterClass.name
    }));
  }

  /**
   * Validate that an object implements the IPlatformAdapter interface
   */
  private _validateAdapterInterface(adapter: unknown): adapter is IPlatformAdapter {
    if (!adapter || typeof adapter !== 'object') {
      return false;
    }

    const requiredProperties = ['name', 'version', 'status'];
    const requiredMethods = [
      'initialize', 'connect', 'disconnect', 'sendMessage',
      'getStatus', 'destroy', 'on', 'emit', 'off', 'removeAllListeners'
    ];

    // Check required properties
    for (const prop of requiredProperties) {
      if (!(prop in adapter)) {
        return false;
      }
    }

    // Check required methods
    for (const method of requiredMethods) {
      if (!(method in adapter) || typeof (adapter as any)[method] !== 'function') {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a new registry instance (for testing)
   */
  public static createInstance(): PlatformAdapterRegistry {
    return new PlatformAdapterRegistry();
  }
}
