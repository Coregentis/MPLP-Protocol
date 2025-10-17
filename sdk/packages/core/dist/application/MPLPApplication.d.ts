import { EventEmitter } from 'events';
import { ApplicationConfig } from './ApplicationConfig';
import { ApplicationStatus } from './ApplicationStatus';
import { BaseModule } from '../modules/BaseModule';
/**
 * MPLPApplication - Core application class for MPLP SDK
 *
 * This class provides the main entry point for creating and managing
 * multi-agent applications using the MPLP protocol.
 *
 * Features:
 * - Application lifecycle management
 * - Module registration and management
 * - Health monitoring
 * - Event-driven architecture
 * - Configuration management
 * - Logging and error handling
 *
 * @example
 * ```typescript
 * const app = new MPLPApplication({
 *   name: 'MyBot',
 *   version: '1.0.0'
 * });
 *
 * await app.initialize();
 * await app.registerModule('context', new ContextModule());
 * await app.start();
 * ```
 */
export declare class MPLPApplication extends EventEmitter {
    private readonly id;
    private readonly config;
    private readonly moduleManager;
    private readonly healthChecker;
    private readonly eventBus;
    private readonly configManager;
    private readonly logger;
    private status;
    private startTime?;
    private stopTime?;
    /**
     * Creates a new MPLP application instance
     *
     * @param config - Application configuration
     */
    constructor(config: ApplicationConfig);
    /**
     * Gets the application ID
     */
    getId(): string;
    /**
     * Gets the application configuration
     */
    getConfig(): ApplicationConfig;
    /**
     * Gets the current application status
     */
    getStatus(): ApplicationStatus;
    /**
     * Gets application uptime in milliseconds
     */
    getUptime(): number;
    /**
     * Initializes the application
     *
     * This method prepares the application for use by:
     * - Validating configuration
     * - Setting up core services
     * - Preparing module registry
     *
     * @throws {ApplicationError} If initialization fails
     */
    initialize(): Promise<void>;
    /**
     * Registers a module with the application
     *
     * @param name - Module name
     * @param module - Module instance
     * @throws {ApplicationError} If registration fails
     */
    registerModule<T extends BaseModule>(name: string, module: T): Promise<void>;
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
     * Starts the application
     *
     * This method:
     * - Starts all registered modules
     * - Begins health monitoring
     * - Sets application status to running
     *
     * @throws {ApplicationError} If start fails
     */
    start(): Promise<void>;
    /**
     * Stops the application gracefully
     *
     * @throws {ApplicationError} If stop fails
     */
    stop(): Promise<void>;
    /**
     * Gets the current health status of the application
     */
    getHealthStatus(): Promise<any>;
    /**
     * Gets application statistics
     */
    getStats(): any;
    /**
     * Validates the application configuration
     *
     * @private
     * @throws {ApplicationError} If configuration is invalid
     */
    private validateConfig;
}
//# sourceMappingURL=MPLPApplication.d.ts.map