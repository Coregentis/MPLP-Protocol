"use strict";
/**
 * @fileoverview Utility functions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAgentId = generateAgentId;
exports.validateAgentConfig = validateAgentConfig;
exports.validatePlatformConfig = validatePlatformConfig;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.isPlainObject = isPlainObject;
exports.sanitizeAgentName = sanitizeAgentName;
exports.calculateUptime = calculateUptime;
exports.formatUptime = formatUptime;
exports.delay = delay;
exports.retryWithBackoff = retryWithBackoff;
const uuid_1 = require("uuid");
const errors_1 = require("../types/errors");
/**
 * Generate a unique agent ID
 */
function generateAgentId() {
    return `agent-${(0, uuid_1.v4)()}`;
}
/**
 * Validate agent configuration
 */
function validateAgentConfig(config) {
    if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
        throw new errors_1.AgentConfigurationError('Agent name is required and must be a non-empty string');
    }
    if (!Array.isArray(config.capabilities) || config.capabilities.length === 0) {
        throw new errors_1.AgentConfigurationError('Agent must have at least one capability');
    }
    // Validate capabilities
    const validCapabilities = [
        'social_media_posting',
        'content_generation',
        'data_analysis',
        'task_automation',
        'communication',
        'monitoring',
        'custom'
    ];
    for (const capability of config.capabilities) {
        if (!validCapabilities.includes(capability)) {
            throw new errors_1.AgentConfigurationError(`Invalid capability '${capability}'. Valid capabilities are: ${validCapabilities.join(', ')}`);
        }
    }
    // Validate platform config if provided
    if (config.platform && !config.platformConfig) {
        throw new errors_1.AgentConfigurationError('Platform configuration is required when platform is specified');
    }
}
/**
 * Validate platform configuration
 */
function validatePlatformConfig(platform, config) {
    if (!platform || typeof platform !== 'string' || platform.trim().length === 0) {
        throw new errors_1.AgentConfigurationError('Platform name is required and must be a non-empty string');
    }
    if (!config || typeof config !== 'object') {
        throw new errors_1.AgentConfigurationError('Platform configuration must be an object');
    }
    // Basic validation for common platform config fields
    if (config.timeout !== undefined) {
        if (typeof config.timeout !== 'number' || config.timeout <= 0) {
            throw new errors_1.AgentConfigurationError('Platform timeout must be a positive number');
        }
    }
    if (config.retries !== undefined) {
        if (typeof config.retries !== 'number' || config.retries < 0 || !Number.isInteger(config.retries)) {
            throw new errors_1.AgentConfigurationError('Platform retries must be a non-negative integer');
        }
    }
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
/**
 * Merge two objects deeply
 */
function deepMerge(target, source) {
    const result = deepClone(target);
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (sourceValue &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                !(sourceValue instanceof Date) &&
                targetValue &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue) &&
                !(targetValue instanceof Date)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = deepClone(sourceValue);
            }
        }
    }
    return result;
}
/**
 * Check if a value is a plain object
 */
function isPlainObject(value) {
    return (value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp) &&
        !(value instanceof Error));
}
/**
 * Sanitize agent name for use as identifier
 */
function sanitizeAgentName(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
/**
 * Calculate uptime in milliseconds
 */
function calculateUptime(startTime) {
    return Date.now() - startTime.getTime();
}
/**
 * Format uptime as human-readable string
 */
function formatUptime(uptimeMs) {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
/**
 * Create a delay promise
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) {
                throw lastError;
            }
            const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await delay(delayMs);
        }
    }
    throw lastError;
}
//# sourceMappingURL=index.js.map