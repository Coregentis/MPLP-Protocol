import { ApplicationConfig } from '../application/ApplicationConfig';
import { EventEmitter } from 'events';
/**
 * Configuration source types
 */
export type ConfigSource = 'default' | 'file' | 'environment' | 'runtime';
/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
    key: string;
    oldValue: unknown;
    newValue: unknown;
    source: ConfigSource;
    timestamp: Date;
}
/**
 * Configuration template
 */
export interface ConfigTemplate {
    name: string;
    description?: string;
    config: Partial<ApplicationConfig>;
    variables?: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'object';
        description?: string;
        default?: unknown;
        required?: boolean;
        validation?: (value: unknown) => boolean;
    }>;
}
/**
 * Configuration validation rule
 */
export interface ConfigValidationRule {
    key: string;
    validator: (value: unknown) => boolean | string;
    message?: string;
}
/**
 * Configuration watcher options
 */
export interface ConfigWatchOptions {
    enabled: boolean;
    files?: string[];
    interval?: number;
    debounce?: number;
}
/**
 * Enhanced Configuration Manager
 *
 * Advanced configuration management with environment variables,
 * hot reloading, templates, validation, and change tracking.
 */
export declare class ConfigManager extends EventEmitter {
    private config;
    private originalConfig;
    private configSources;
    private validationRules;
    private templates;
    private watchers;
    private watchOptions;
    private configHistory;
    constructor(userConfig: ApplicationConfig, options?: {
        enableEnvironmentVariables?: boolean;
        enableHotReload?: boolean;
        watchOptions?: ConfigWatchOptions;
        templates?: ConfigTemplate[];
    });
    /**
     * Processes environment variables and replaces placeholders
     */
    private processEnvironmentVariables;
    /**
     * Initializes the configuration manager
     */
    initialize(): Promise<void>;
    /**
     * Sets up file watchers for hot reload
     */
    private setupFileWatchers;
    /**
     * Debounced configuration reload
     */
    private debounceReload;
    /**
     * Debounce utility function
     */
    private debounce;
    /**
     * Loads configuration from files
     */
    private loadConfigurationFiles;
    /**
     * Loads configuration from a specific file
     */
    private loadFromFile;
    /**
     * Reloads configuration from a file
     */
    private reloadFromFile;
    /**
     * Gets the complete configuration
     */
    getConfig(): ApplicationConfig;
    /**
     * Gets a specific configuration value with type safety
     *
     * @param key - Configuration key (supports dot notation)
     * @param defaultValue - Default value if key doesn't exist
     * @returns Configuration value
     */
    get<T = any>(key: string, defaultValue?: T): T | undefined;
    /**
     * Sets a configuration value with validation and change tracking
     *
     * @param key - Configuration key (supports dot notation)
     * @param value - Configuration value
     * @param source - Source of the configuration change
     */
    set(key: string, value: any, source?: ConfigSource): void;
    /**
     * Merges configuration from another source
     */
    private mergeConfig;
    /**
     * Validates a configuration value against registered rules
     */
    private validateValue;
    /**
     * Checks if a configuration key exists
     *
     * @param key - Configuration key
     * @returns True if the key exists
     */
    has(key: string): boolean;
    /**
     * Adds a validation rule for a configuration key
     */
    addValidationRule(rule: ConfigValidationRule): void;
    /**
     * Removes a validation rule
     */
    removeValidationRule(key: string): void;
    /**
     * Applies a configuration template
     */
    applyTemplate(templateName: string, variables?: Record<string, any>): void;
    /**
     * Processes template variables in configuration
     */
    private processTemplateVariables;
    /**
     * Gets configuration change history
     */
    getChangeHistory(limit?: number): ConfigChangeEvent[];
    /**
     * Gets the source of a configuration value
     */
    getSource(key: string): ConfigSource | undefined;
    /**
     * Resets configuration to original state
     */
    reset(): void;
    /**
     * Creates a configuration snapshot
     */
    createSnapshot(): {
        config: ApplicationConfig;
        sources: Record<string, ConfigSource>;
        timestamp: Date;
    };
    /**
     * Restores configuration from a snapshot
     */
    restoreSnapshot(snapshot: {
        config: ApplicationConfig;
        sources: Record<string, ConfigSource>;
    }): void;
    /**
     * Exports configuration to JSON
     */
    export(includeDefaults?: boolean): string;
    /**
     * Validates the entire configuration
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Cleanup resources
     */
    destroy(): void;
}
//# sourceMappingURL=ConfigManager.d.ts.map