/**
 * Application Configuration Interface
 *
 * Defines the configuration structure for MPLP applications.
 * This interface provides type safety and documentation for all
 * configuration options available to MPLP applications.
 */
export interface ApplicationConfig {
    /**
     * Application name (required)
     * Used for logging, monitoring, and identification
     */
    name: string;
    /**
     * Application version (required)
     * Should follow semantic versioning (e.g., "1.0.0")
     */
    version: string;
    /**
     * Application description (optional)
     * Brief description of what the application does
     */
    description?: string;
    /**
     * Application environment (optional)
     * Defaults to 'development'
     */
    environment?: 'development' | 'staging' | 'production';
    /**
     * Logging configuration (optional)
     */
    logging?: {
        /**
         * Log level
         * Defaults to 'info'
         */
        level?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
        /**
         * Log format
         * Defaults to 'json'
         */
        format?: 'json' | 'simple' | 'combined';
        /**
         * Log file path (optional)
         * If not provided, logs only to console
         */
        file?: string;
        /**
         * Enable console logging
         * Defaults to true
         */
        console?: boolean;
    };
    /**
     * Health check configuration (optional)
     */
    health?: {
        /**
         * Health check interval in milliseconds
         * Defaults to 30000 (30 seconds)
         */
        interval?: number;
        /**
         * Health check timeout in milliseconds
         * Defaults to 5000 (5 seconds)
         */
        timeout?: number;
        /**
         * Enable health check endpoint
         * Defaults to false
         */
        endpoint?: boolean;
        /**
         * Health check endpoint port
         * Defaults to 3000
         */
        port?: number;
    };
    /**
     * Module configuration (optional)
     */
    modules?: {
        /**
         * Module loading timeout in milliseconds
         * Defaults to 10000 (10 seconds)
         */
        loadTimeout?: number;
        /**
         * Module startup timeout in milliseconds
         * Defaults to 30000 (30 seconds)
         */
        startTimeout?: number;
        /**
         * Enable module hot reload in development
         * Defaults to false
         */
        hotReload?: boolean;
    };
    /**
     * Event system configuration (optional)
     */
    events?: {
        /**
         * Maximum number of listeners per event
         * Defaults to 10
         */
        maxListeners?: number;
        /**
         * Enable event debugging
         * Defaults to false
         */
        debug?: boolean;
    };
    /**
     * Performance monitoring configuration (optional)
     */
    monitoring?: {
        /**
         * Enable performance monitoring
         * Defaults to false
         */
        enabled?: boolean;
        /**
         * Metrics collection interval in milliseconds
         * Defaults to 60000 (1 minute)
         */
        interval?: number;
        /**
         * Memory usage threshold for warnings (in MB)
         * Defaults to 512
         */
        memoryThreshold?: number;
    };
    /**
     * Security configuration (optional)
     */
    security?: {
        /**
         * Enable security features
         * Defaults to true
         */
        enabled?: boolean;
        /**
         * API key for external services (optional)
         */
        apiKey?: string;
        /**
         * Secret key for encryption (optional)
         */
        secretKey?: string;
        /**
         * Allowed origins for CORS (optional)
         */
        allowedOrigins?: string[];
    };
    /**
     * Custom configuration properties
     * Applications can extend this with their own configuration
     */
    [key: string]: any;
}
/**
 * Default application configuration
 * Provides sensible defaults for all optional configuration options
 */
export declare const DEFAULT_APPLICATION_CONFIG: Partial<ApplicationConfig>;
/**
 * Validates application configuration
 *
 * @param config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
export declare function validateApplicationConfig(config: ApplicationConfig): void;
/**
 * Merges user configuration with default configuration
 *
 * @param userConfig - User-provided configuration
 * @returns Merged configuration with defaults
 */
export declare function mergeWithDefaults(userConfig: ApplicationConfig): ApplicationConfig;
//# sourceMappingURL=ApplicationConfig.d.ts.map