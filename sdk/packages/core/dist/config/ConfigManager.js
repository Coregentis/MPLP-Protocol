"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const ApplicationConfig_1 = require("../application/ApplicationConfig");
const events_1 = require("events");
const fs = __importStar(require("fs"));
/**
 * Enhanced Configuration Manager
 *
 * Advanced configuration management with environment variables,
 * hot reloading, templates, validation, and change tracking.
 */
class ConfigManager extends events_1.EventEmitter {
    constructor(userConfig, options = {}) {
        super();
        this.configSources = new Map();
        this.validationRules = [];
        this.templates = new Map();
        this.watchers = new Map();
        this.watchOptions = { enabled: false };
        this.configHistory = [];
        /**
         * Debounced configuration reload
         */
        this.debounceReload = this.debounce(async (filePath) => {
            try {
                await this.reloadFromFile(filePath);
            }
            catch (error) {
                this.emit('error', { error, filePath });
            }
        }, this.watchOptions.debounce || 1000);
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
        (0, ApplicationConfig_1.validateApplicationConfig)(processedConfig);
        // Merge with defaults
        this.config = (0, ApplicationConfig_1.mergeWithDefaults)(processedConfig);
        // Set up hot reload if enabled
        if (options.enableHotReload && options.watchOptions) {
            this.watchOptions = options.watchOptions;
        }
    }
    /**
     * Processes environment variables and replaces placeholders
     */
    processEnvironmentVariables(config) {
        const processed = JSON.parse(JSON.stringify(config));
        const processValue = (value) => {
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
            }
            else if (Array.isArray(value)) {
                return value.map(processValue);
            }
            else if (value && typeof value === 'object') {
                const result = {};
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
    async initialize() {
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
    async setupFileWatchers() {
        if (!this.watchOptions.files)
            return;
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
     * Debounce utility function
     */
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    /**
     * Loads configuration from files
     */
    async loadConfigurationFiles() {
        if (!this.watchOptions.files)
            return;
        for (const filePath of this.watchOptions.files) {
            if (fs.existsSync(filePath)) {
                await this.loadFromFile(filePath);
            }
        }
    }
    /**
     * Loads configuration from a specific file
     */
    async loadFromFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileConfig = JSON.parse(content);
            // Merge file configuration
            this.mergeConfig(fileConfig, 'file');
        }
        catch (error) {
            this.emit('error', { error, filePath, operation: 'load' });
        }
    }
    /**
     * Reloads configuration from a file
     */
    async reloadFromFile(filePath) {
        await this.loadFromFile(filePath);
        this.emit('configReloaded', { filePath, config: this.getConfig() });
    }
    /**
     * Gets the complete configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Gets a specific configuration value with type safety
     *
     * @param key - Configuration key (supports dot notation)
     * @param defaultValue - Default value if key doesn't exist
     * @returns Configuration value
     */
    get(key, defaultValue) {
        const keys = key.split('.');
        let value = this.config;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
    /**
     * Sets a configuration value with validation and change tracking
     *
     * @param key - Configuration key (supports dot notation)
     * @param value - Configuration value
     * @param source - Source of the configuration change
     */
    set(key, value, source = 'runtime') {
        const oldValue = this.get(key);
        // Validate the new value
        this.validateValue(key, value);
        const keys = key.split('.');
        let current = this.config;
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
        const changeEvent = {
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
    mergeConfig(newConfig, source) {
        const changes = [];
        const mergeRecursive = (target, source, keyPath = '') => {
            for (const [key, value] of Object.entries(source)) {
                const fullKey = keyPath ? `${keyPath}.${key}` : key;
                const oldValue = this.get(fullKey);
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    mergeRecursive(target[key], value, fullKey);
                }
                else {
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
    validateValue(key, value) {
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
    has(key) {
        return this.get(key) !== undefined;
    }
    /**
     * Adds a validation rule for a configuration key
     */
    addValidationRule(rule) {
        // Remove existing rule for the same key
        this.validationRules = this.validationRules.filter(r => r.key !== rule.key);
        this.validationRules.push(rule);
    }
    /**
     * Removes a validation rule
     */
    removeValidationRule(key) {
        this.validationRules = this.validationRules.filter(r => r.key !== key);
    }
    /**
     * Applies a configuration template
     */
    applyTemplate(templateName, variables = {}) {
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
    processTemplateVariables(config, variables, variableDefs) {
        const processed = JSON.parse(JSON.stringify(config));
        const processValue = (value) => {
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
            }
            else if (Array.isArray(value)) {
                return value.map(processValue);
            }
            else if (value && typeof value === 'object') {
                const result = {};
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
    getChangeHistory(limit) {
        const history = [...this.configHistory];
        return limit ? history.slice(-limit) : history;
    }
    /**
     * Gets the source of a configuration value
     */
    getSource(key) {
        return this.configSources.get(key);
    }
    /**
     * Resets configuration to original state
     */
    reset() {
        const oldConfig = { ...this.config };
        this.config = (0, ApplicationConfig_1.mergeWithDefaults)(this.originalConfig);
        this.configSources.clear();
        this.configHistory = [];
        this.emit('configReset', { oldConfig, newConfig: this.config });
    }
    /**
     * Creates a configuration snapshot
     */
    createSnapshot() {
        return {
            config: { ...this.config },
            sources: Object.fromEntries(this.configSources),
            timestamp: new Date(),
        };
    }
    /**
     * Restores configuration from a snapshot
     */
    restoreSnapshot(snapshot) {
        const oldConfig = { ...this.config };
        this.config = { ...snapshot.config };
        this.configSources = new Map(Object.entries(snapshot.sources));
        this.emit('configRestored', { oldConfig, newConfig: this.config });
    }
    /**
     * Exports configuration to JSON
     */
    export(includeDefaults = false) {
        const configToExport = includeDefaults ? this.config : this.originalConfig;
        return JSON.stringify(configToExport, null, 2);
    }
    /**
     * Validates the entire configuration
     */
    validate() {
        const errors = [];
        try {
            (0, ApplicationConfig_1.validateApplicationConfig)(this.config);
        }
        catch (error) {
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
    destroy() {
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
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map