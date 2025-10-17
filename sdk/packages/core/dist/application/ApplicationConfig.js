"use strict";
/**
 * Application Configuration Interface
 *
 * Defines the configuration structure for MPLP applications.
 * This interface provides type safety and documentation for all
 * configuration options available to MPLP applications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_APPLICATION_CONFIG = void 0;
exports.validateApplicationConfig = validateApplicationConfig;
exports.mergeWithDefaults = mergeWithDefaults;
/**
 * Default application configuration
 * Provides sensible defaults for all optional configuration options
 */
exports.DEFAULT_APPLICATION_CONFIG = {
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
function validateApplicationConfig(config) {
    if (!config.name || typeof config.name !== 'string') {
        throw new Error('Application name is required and must be a string');
    }
    if (!config.version || typeof config.version !== 'string') {
        throw new Error('Application version is required and must be a string');
    }
    // Validate semantic versioning format
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
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
function mergeWithDefaults(userConfig) {
    return {
        ...exports.DEFAULT_APPLICATION_CONFIG,
        ...userConfig,
        logging: {
            ...exports.DEFAULT_APPLICATION_CONFIG.logging,
            ...userConfig.logging,
        },
        health: {
            ...exports.DEFAULT_APPLICATION_CONFIG.health,
            ...userConfig.health,
        },
        modules: {
            ...exports.DEFAULT_APPLICATION_CONFIG.modules,
            ...userConfig.modules,
        },
        events: {
            ...exports.DEFAULT_APPLICATION_CONFIG.events,
            ...userConfig.events,
        },
        monitoring: {
            ...exports.DEFAULT_APPLICATION_CONFIG.monitoring,
            ...userConfig.monitoring,
        },
        security: {
            ...exports.DEFAULT_APPLICATION_CONFIG.security,
            ...userConfig.security,
        },
    };
}
//# sourceMappingURL=ApplicationConfig.js.map