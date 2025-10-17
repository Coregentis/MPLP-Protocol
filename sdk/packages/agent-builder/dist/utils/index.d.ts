/**
 * @fileoverview Utility functions for MPLP Agent Builder
 * @version 1.1.0-beta
 */
import { AgentConfig, PlatformConfig } from '../types';
/**
 * Generate a unique agent ID
 */
export declare function generateAgentId(): string;
/**
 * Validate agent configuration
 */
export declare function validateAgentConfig(config: AgentConfig): void;
/**
 * Validate platform configuration
 */
export declare function validatePlatformConfig(platform: string, config: PlatformConfig): void;
/**
 * Deep clone an object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Merge two objects deeply
 */
export declare function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T;
/**
 * Check if a value is a plain object
 */
export declare function isPlainObject(value: unknown): value is Record<string, unknown>;
/**
 * Sanitize agent name for use as identifier
 */
export declare function sanitizeAgentName(name: string): string;
/**
 * Calculate uptime in milliseconds
 */
export declare function calculateUptime(startTime: Date): number;
/**
 * Format uptime as human-readable string
 */
export declare function formatUptime(uptimeMs: number): string;
/**
 * Create a delay promise
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Retry a function with exponential backoff
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number, maxDelay?: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map