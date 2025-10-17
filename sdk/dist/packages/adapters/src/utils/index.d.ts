/**
 * @fileoverview Adapter utilities
 */
import { ContentItem, PlatformType, AdapterConfig } from '../core/types';
/**
 * Content validation utilities
 */
export declare class ContentValidator {
    /**
     * Validate content for platform
     */
    static validateForPlatform(content: ContentItem, platform: PlatformType): boolean;
    /**
     * Validate Twitter content
     */
    private static validateTwitterContent;
    /**
     * Validate LinkedIn content
     */
    private static validateLinkedInContent;
    /**
     * Validate GitHub content
     */
    private static validateGitHubContent;
}
/**
 * Content transformation utilities
 */
export declare class ContentTransformer {
    /**
     * Transform content for platform
     */
    static transformForPlatform(content: ContentItem, platform: PlatformType): ContentItem;
    /**
     * Transform content for Twitter
     */
    private static transformForTwitter;
    /**
     * Transform content for LinkedIn
     */
    private static transformForLinkedIn;
    /**
     * Transform content for GitHub
     */
    private static transformForGitHub;
}
/**
 * Rate limiting utilities
 */
export declare class RateLimitHelper {
    /**
     * Calculate delay for exponential backoff
     */
    static calculateBackoffDelay(attempt: number, baseDelay?: number): number;
    /**
     * Calculate delay for linear backoff
     */
    static calculateLinearDelay(attempt: number, baseDelay?: number): number;
    /**
     * Check if rate limit is exceeded
     */
    static isRateLimited(rateLimitInfo: any): boolean;
    /**
     * Get time until rate limit reset
     */
    static getTimeUntilReset(rateLimitInfo: any): number;
}
/**
 * Configuration utilities
 */
export declare class ConfigHelper {
    /**
     * Merge configurations
     */
    static mergeConfigs(base: Partial<AdapterConfig>, override: Partial<AdapterConfig>): AdapterConfig;
    /**
     * Validate configuration completeness
     */
    static validateConfig(config: AdapterConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Sanitize configuration for logging
     */
    static sanitizeConfig(config: AdapterConfig): Partial<AdapterConfig>;
}
/**
 * URL and link utilities
 */
export declare class UrlHelper {
    /**
     * Extract URLs from text
     */
    static extractUrls(text: string): string[];
    /**
     * Shorten URLs for platforms with character limits
     */
    static shortenUrls(text: string, maxLength?: number): string;
    /**
     * Build platform-specific URLs
     */
    static buildPlatformUrl(platform: PlatformType, type: string, id: string): string;
}
/**
 * Error handling utilities
 */
export declare class ErrorHelper {
    /**
     * Create standardized error response
     */
    static createErrorResult(error: Error | string, metadata?: any): any;
    /**
     * Check if error is rate limit related
     */
    static isRateLimitError(error: any): boolean;
    /**
     * Check if error is authentication related
     */
    static isAuthError(error: any): boolean;
    /**
     * Get retry delay from error
     */
    static getRetryDelay(error: any): number;
}
/**
 * Analytics utilities
 */
export declare class AnalyticsHelper {
    /**
     * Calculate engagement rate
     */
    static calculateEngagementRate(metrics: any): number;
    /**
     * Aggregate metrics from multiple platforms
     */
    static aggregateMetrics(metricsMap: Map<string, any>): any;
}
//# sourceMappingURL=index.d.ts.map