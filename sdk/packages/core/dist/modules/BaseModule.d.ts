import { EventEmitter } from 'events';
/**
 * Base Module Class
 *
 * Abstract base class that all MPLP modules must extend.
 * Provides common functionality and lifecycle management for modules.
 */
export declare abstract class BaseModule extends EventEmitter {
    protected name: string;
    protected version: string;
    protected status: string;
    protected initialized: boolean;
    protected started: boolean;
    constructor(name: string, version?: string);
    /**
     * Gets the module name
     */
    getName(): string;
    /**
     * Gets the module version
     */
    getVersion(): string;
    /**
     * Gets the current module status
     */
    getStatus(): string;
    /**
     * Checks if the module is initialized
     */
    isInitialized(): boolean;
    /**
     * Checks if the module is started
     */
    isStarted(): boolean;
    /**
     * Initializes the module
     * Subclasses should override this method to provide custom initialization logic
     */
    initialize(): Promise<void>;
    /**
     * Starts the module
     * Subclasses should override this method to provide custom start logic
     */
    start(): Promise<void>;
    /**
     * Stops the module
     * Subclasses should override this method to provide custom stop logic
     */
    stop(): Promise<void>;
    /**
     * Restarts the module
     */
    restart(): Promise<void>;
    /**
     * Checks if the module is healthy
     * Subclasses should override this method to provide custom health checks
     */
    isHealthy(): Promise<boolean>;
    /**
     * Gets module configuration
     * Subclasses can override this method to provide configuration information
     */
    getConfig(): Record<string, any>;
    /**
     * Gets module statistics
     * Subclasses can override this method to provide custom statistics
     */
    getStats(): Record<string, any>;
    /**
     * Custom initialization logic
     * Subclasses must implement this method
     */
    protected abstract onInitialize(): Promise<void>;
    /**
     * Custom start logic
     * Subclasses must implement this method
     */
    protected abstract onStart(): Promise<void>;
    /**
     * Custom stop logic
     * Subclasses must implement this method
     */
    protected abstract onStop(): Promise<void>;
    /**
     * Custom health check logic
     * Subclasses can override this method (default returns true)
     */
    protected onHealthCheck(): Promise<boolean>;
}
//# sourceMappingURL=BaseModule.d.ts.map