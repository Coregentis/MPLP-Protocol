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
export const DEFAULT_APPLICATION_CONFIG: Partial<ApplicationConfig> = {
  environment: 'development',
  logging: {
    level: 'info',
    format: 'json',
    console: true,
  },
  health: {
    interval: 30000,
    timeout: 5000,
    endpoint: false,
    port: 3000,
  },
  modules: {
    loadTimeout: 10000,
    startTimeout: 30000,
    hotReload: false,
  },
  events: {
    maxListeners: 10,
    debug: false,
  },
  monitoring: {
    enabled: false,
    interval: 60000,
    memoryThreshold: 512,
  },
  security: {
    enabled: true,
    allowedOrigins: ['http://localhost:3000'],
  },
};

/**
 * Validates application configuration
 *
 * @param config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
export function validateApplicationConfig(config: ApplicationConfig): void {
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Application name is required and must be a string');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new Error('Application version is required and must be a string');
  }

  // Validate semantic versioning format
  const semverRegex =
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  if (!semverRegex.test(config.version)) {
    throw new Error('Application version must follow semantic versioning format (e.g., "1.0.0")');
  }

  // Validate environment
  if (config.environment && !['development', 'staging', 'production'].includes(config.environment)) {
    throw new Error('Environment must be one of: development, staging, production');
  }

  // Validate logging configuration
  if (config.logging?.level && !['error', 'warn', 'info', 'debug', 'verbose'].includes(config.logging.level)) {
    throw new Error('Log level must be one of: error, warn, info, debug, verbose');
  }

  if (config.logging?.format && !['json', 'simple', 'combined'].includes(config.logging.format)) {
    throw new Error('Log format must be one of: json, simple, combined');
  }

  // Validate health check configuration
  if (config.health?.interval && (config.health.interval < 1000 || config.health.interval > 300000)) {
    throw new Error('Health check interval must be between 1000ms and 300000ms');
  }

  if (config.health?.timeout && (config.health.timeout < 100 || config.health.timeout > 30000)) {
    throw new Error('Health check timeout must be between 100ms and 30000ms');
  }

  if (config.health?.port && (config.health.port < 1 || config.health.port > 65535)) {
    throw new Error('Health check port must be between 1 and 65535');
  }
}

/**
 * Merges user configuration with default configuration
 *
 * @param userConfig - User-provided configuration
 * @returns Merged configuration with defaults
 */
export function mergeWithDefaults(userConfig: ApplicationConfig): ApplicationConfig {
  return {
    ...DEFAULT_APPLICATION_CONFIG,
    ...userConfig,
    logging: {
      ...DEFAULT_APPLICATION_CONFIG.logging,
      ...userConfig.logging,
    },
    health: {
      ...DEFAULT_APPLICATION_CONFIG.health,
      ...userConfig.health,
    },
    modules: {
      ...DEFAULT_APPLICATION_CONFIG.modules,
      ...userConfig.modules,
    },
    events: {
      ...DEFAULT_APPLICATION_CONFIG.events,
      ...userConfig.events,
    },
    monitoring: {
      ...DEFAULT_APPLICATION_CONFIG.monitoring,
      ...userConfig.monitoring,
    },
    security: {
      ...DEFAULT_APPLICATION_CONFIG.security,
      ...userConfig.security,
    },
  };
}
