import { ApplicationConfig, validateApplicationConfig, mergeWithDefaults } from '../application/ApplicationConfig';
import { EventEmitter } from 'events';
import * as fs from 'fs';

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
  variables?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'object';
      description?: string;
      default?: unknown;
      required?: boolean;
      validation?: (value: unknown) => boolean;
    }
  >;
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
export class ConfigManager extends EventEmitter {
  private config: ApplicationConfig;
  private originalConfig: ApplicationConfig;
  private configSources: Map<string, ConfigSource> = new Map();
  private validationRules: ConfigValidationRule[] = [];
  private templates: Map<string, ConfigTemplate> = new Map();
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private watchOptions: ConfigWatchOptions = { enabled: false };
  private configHistory: ConfigChangeEvent[] = [];

  constructor(
    userConfig: ApplicationConfig,
    options: {
      enableEnvironmentVariables?: boolean;
      enableHotReload?: boolean;
      watchOptions?: ConfigWatchOptions;
      templates?: ConfigTemplate[];
    } = {}
  ) {
    super();

    this.originalConfig = { ...userConfig };

    // Load templates
    if (options.templates) {
      for (const template of options.templates) {
        this.templates.set(template.name, template);
      }
    }

    // Process environment variables if enabled
    let processedConfig = userConfig;
    if (options.enableEnvironmentVariables !== false) {
      processedConfig = this.processEnvironmentVariables(userConfig);
    }

    // Validate the user configuration
    validateApplicationConfig(processedConfig);

    // Merge with defaults
    this.config = mergeWithDefaults(processedConfig);

    // Set up hot reload if enabled
    if (options.enableHotReload && options.watchOptions) {
      this.watchOptions = options.watchOptions;
    }
  }

  /**
   * Processes environment variables and replaces placeholders
   */
  private processEnvironmentVariables(config: any): any {
    const processed = JSON.parse(JSON.stringify(config));

    const processValue = (value: any): any => {
      if (typeof value === 'string') {
        // Replace ${ENV_VAR} or ${ENV_VAR:default} patterns
        return value.replace(/\$\{([^}:]+)(?::([^}]*))?\}/g, (match, envVar, defaultValue) => {
          const envValue = process.env[envVar];
          if (envValue !== undefined) {
            this.configSources.set(envVar, 'environment');
            return envValue;
          }
          return defaultValue || match;
        });
      } else if (Array.isArray(value)) {
        return value.map(processValue);
      } else if (value && typeof value === 'object') {
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
          result[key] = processValue(val);
        }
        return result;
      }
      return value;
    };

    return processValue(processed);
  }

  /**
   * Initializes the configuration manager
   */
  async initialize(): Promise<void> {
    // Set up file watchers if hot reload is enabled
    if (this.watchOptions.enabled && this.watchOptions.files) {
      await this.setupFileWatchers();
    }

    // Load additional configuration from files
    await this.loadConfigurationFiles();

    this.emit('initialized', { config: this.getConfig() });
  }

  /**
   * Sets up file watchers for hot reload
   */
  private async setupFileWatchers(): Promise<void> {
    if (!this.watchOptions.files) return;

    for (const filePath of this.watchOptions.files) {
      if (fs.existsSync(filePath)) {
        const watcher = fs.watch(filePath, { persistent: false }, eventType => {
          if (eventType === 'change') {
            this.debounceReload(filePath);
          }
        });
        this.watchers.set(filePath, watcher);
      }
    }
  }

  /**
   * Debounced configuration reload
   */
  private debounceReload = this.debounce(async (filePath: string) => {
    try {
      await this.reloadFromFile(filePath);
    } catch (error) {
      this.emit('error', { error, filePath });
    }
  }, this.watchOptions.debounce || 1000);

  /**
   * Debounce utility function
   */
  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Loads configuration from files
   */
  private async loadConfigurationFiles(): Promise<void> {
    if (!this.watchOptions.files) return;

    for (const filePath of this.watchOptions.files) {
      if (fs.existsSync(filePath)) {
        await this.loadFromFile(filePath);
      }
    }
  }

  /**
   * Loads configuration from a specific file
   */
  private async loadFromFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileConfig = JSON.parse(content);

      // Merge file configuration
      this.mergeConfig(fileConfig, 'file');
    } catch (error) {
      this.emit('error', { error, filePath, operation: 'load' });
    }
  }

  /**
   * Reloads configuration from a file
   */
  private async reloadFromFile(filePath: string): Promise<void> {
    await this.loadFromFile(filePath);
    this.emit('configReloaded', { filePath, config: this.getConfig() });
  }

  /**
   * Gets the complete configuration
   */
  getConfig(): ApplicationConfig {
    return { ...this.config };
  }

  /**
   * Gets a specific configuration value with type safety
   *
   * @param key - Configuration key (supports dot notation)
   * @param defaultValue - Default value if key doesn't exist
   * @returns Configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value as T;
  }

  /**
   * Sets a configuration value with validation and change tracking
   *
   * @param key - Configuration key (supports dot notation)
   * @param value - Configuration value
   * @param source - Source of the configuration change
   */
  set(key: string, value: any, source: ConfigSource = 'runtime'): void {
    const oldValue = this.get(key);

    // Validate the new value
    this.validateValue(key, value);

    const keys = key.split('.');
    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.configSources.set(key, source);

    // Track the change
    const changeEvent: ConfigChangeEvent = {
      key,
      oldValue,
      newValue: value,
      source,
      timestamp: new Date(),
    };

    this.configHistory.push(changeEvent);

    // Emit change event
    this.emit('configChanged', changeEvent);
  }

  /**
   * Merges configuration from another source
   */
  private mergeConfig(newConfig: Partial<ApplicationConfig>, source: ConfigSource): void {
    const changes: ConfigChangeEvent[] = [];

    const mergeRecursive = (target: any, source: any, keyPath: string = '') => {
      for (const [key, value] of Object.entries(source)) {
        const fullKey = keyPath ? `${keyPath}.${key}` : key;
        const oldValue = this.get(fullKey);

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          mergeRecursive(target[key], value, fullKey);
        } else {
          target[key] = value;
          this.configSources.set(fullKey, source);

          changes.push({
            key: fullKey,
            oldValue,
            newValue: value,
            source,
            timestamp: new Date(),
          });
        }
      }
    };

    mergeRecursive(this.config, newConfig);

    // Track all changes
    this.configHistory.push(...changes);

    // Emit batch change event
    this.emit('configMerged', { changes, source });
  }

  /**
   * Validates a configuration value against registered rules
   */
  private validateValue(key: string, value: any): void {
    const rule = this.validationRules.find(r => r.key === key);
    if (rule) {
      const result = rule.validator(value);
      if (result !== true) {
        const message = typeof result === 'string' ? result : rule.message || `Invalid value for ${key}`;
        throw new Error(message);
      }
    }
  }

  /**
   * Checks if a configuration key exists
   *
   * @param key - Configuration key
   * @returns True if the key exists
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Adds a validation rule for a configuration key
   */
  addValidationRule(rule: ConfigValidationRule): void {
    // Remove existing rule for the same key
    this.validationRules = this.validationRules.filter(r => r.key !== rule.key);
    this.validationRules.push(rule);
  }

  /**
   * Removes a validation rule
   */
  removeValidationRule(key: string): void {
    this.validationRules = this.validationRules.filter(r => r.key !== key);
  }

  /**
   * Applies a configuration template
   */
  applyTemplate(templateName: string, variables: Record<string, any> = {}): void {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Validate required variables
    if (template.variables) {
      for (const [varName, varDef] of Object.entries(template.variables)) {
        if (varDef.required && !(varName in variables)) {
          throw new Error(`Required template variable '${varName}' is missing`);
        }

        if (varName in variables && varDef.validation) {
          if (!varDef.validation(variables[varName])) {
            throw new Error(`Invalid value for template variable '${varName}'`);
          }
        }
      }
    }

    // Process template with variables
    const processedConfig = this.processTemplateVariables(template.config, variables, template.variables);

    // Merge with current configuration
    this.mergeConfig(processedConfig, 'runtime');

    this.emit('templateApplied', { templateName, variables, config: processedConfig });
  }

  /**
   * Processes template variables in configuration
   */
  private processTemplateVariables(
    config: any,
    variables: Record<string, any>,
    variableDefs?: Record<string, any>
  ): any {
    const processed = JSON.parse(JSON.stringify(config));

    const processValue = (value: any): any => {
      if (typeof value === 'string') {
        return value.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
          if (varName in variables) {
            return variables[varName];
          }

          // Use default value if available
          if (variableDefs && varName in variableDefs && 'default' in variableDefs[varName]) {
            return variableDefs[varName].default;
          }

          return match;
        });
      } else if (Array.isArray(value)) {
        return value.map(processValue);
      } else if (value && typeof value === 'object') {
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
          result[key] = processValue(val);
        }
        return result;
      }
      return value;
    };

    return processValue(processed);
  }

  /**
   * Gets configuration change history
   */
  getChangeHistory(limit?: number): ConfigChangeEvent[] {
    const history = [...this.configHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Gets the source of a configuration value
   */
  getSource(key: string): ConfigSource | undefined {
    return this.configSources.get(key);
  }

  /**
   * Resets configuration to original state
   */
  reset(): void {
    const oldConfig = { ...this.config };
    this.config = mergeWithDefaults(this.originalConfig);
    this.configSources.clear();
    this.configHistory = [];

    this.emit('configReset', { oldConfig, newConfig: this.config });
  }

  /**
   * Creates a configuration snapshot
   */
  createSnapshot(): {
    config: ApplicationConfig;
    sources: Record<string, ConfigSource>;
    timestamp: Date;
  } {
    return {
      config: { ...this.config },
      sources: Object.fromEntries(this.configSources),
      timestamp: new Date(),
    };
  }

  /**
   * Restores configuration from a snapshot
   */
  restoreSnapshot(snapshot: { config: ApplicationConfig; sources: Record<string, ConfigSource> }): void {
    const oldConfig = { ...this.config };
    this.config = { ...snapshot.config };
    this.configSources = new Map(Object.entries(snapshot.sources));

    this.emit('configRestored', { oldConfig, newConfig: this.config });
  }

  /**
   * Exports configuration to JSON
   */
  export(includeDefaults: boolean = false): string {
    const configToExport = includeDefaults ? this.config : this.originalConfig;
    return JSON.stringify(configToExport, null, 2);
  }

  /**
   * Validates the entire configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      validateApplicationConfig(this.config);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    // Run custom validation rules
    for (const rule of this.validationRules) {
      const value = this.get(rule.key);
      if (value !== undefined) {
        const result = rule.validator(value);
        if (result !== true) {
          const message = typeof result === 'string' ? result : rule.message || `Invalid value for ${rule.key}`;
          errors.push(message);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Close file watchers
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();

    // Emit destroyed event before removing listeners
    this.emit('destroyed');

    // Remove all listeners
    this.removeAllListeners();
  }
}
