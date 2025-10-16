/**
 * @fileoverview Utility functions for MPLP Agent Builder
 * @version 1.1.0-beta
 */

import { v4 as uuidv4 } from 'uuid';
import { AgentConfig, AgentCapability, PlatformConfig } from '../types';
import { AgentConfigurationError } from '../types/errors';

/**
 * Generate a unique agent ID
 */
export function generateAgentId(): string {
  return `agent-${uuidv4()}`;
}

/**
 * Validate agent configuration
 */
export function validateAgentConfig(config: AgentConfig): void {
  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    throw new AgentConfigurationError('Agent name is required and must be a non-empty string');
  }

  if (!Array.isArray(config.capabilities) || config.capabilities.length === 0) {
    throw new AgentConfigurationError('Agent must have at least one capability');
  }

  // Validate capabilities
  const validCapabilities: AgentCapability[] = [
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
      throw new AgentConfigurationError(
        `Invalid capability '${capability}'. Valid capabilities are: ${validCapabilities.join(', ')}`
      );
    }
  }

  // Validate platform config if provided
  if (config.platform && !config.platformConfig) {
    throw new AgentConfigurationError('Platform configuration is required when platform is specified');
  }
}

/**
 * Validate platform configuration
 */
export function validatePlatformConfig(platform: string, config: PlatformConfig): void {
  if (!platform || typeof platform !== 'string' || platform.trim().length === 0) {
    throw new AgentConfigurationError('Platform name is required and must be a non-empty string');
  }

  if (!config || typeof config !== 'object') {
    throw new AgentConfigurationError('Platform configuration must be an object');
  }

  // Basic validation for common platform config fields
  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout <= 0) {
      throw new AgentConfigurationError('Platform timeout must be a positive number');
    }
  }

  if (config.retries !== undefined) {
    if (typeof config.retries !== 'number' || config.retries < 0 || !Number.isInteger(config.retries)) {
      throw new AgentConfigurationError('Platform retries must be a non-negative integer');
    }
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
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
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result = deepClone(target);

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        !(sourceValue instanceof Date) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue) &&
        !(targetValue instanceof Date)
      ) {
        (result as Record<string, unknown>)[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        (result as Record<string, unknown>)[key] = deepClone(sourceValue);
      }
    }
  }

  return result;
}

/**
 * Check if a value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof RegExp) &&
    !(value instanceof Error)
  );
}

/**
 * Sanitize agent name for use as identifier
 */
export function sanitizeAgentName(name: string): string {
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
export function calculateUptime(startTime: Date): number {
  return Date.now() - startTime.getTime();
}

/**
 * Format uptime as human-readable string
 */
export function formatUptime(uptimeMs: number): string {
  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delayMs = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await delay(delayMs);
    }
  }

  throw lastError!;
}
