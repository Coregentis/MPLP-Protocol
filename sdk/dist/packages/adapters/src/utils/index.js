"use strict";
/**
 * @fileoverview Adapter utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsHelper = exports.ErrorHelper = exports.UrlHelper = exports.ConfigHelper = exports.RateLimitHelper = exports.ContentTransformer = exports.ContentValidator = void 0;
/**
 * Content validation utilities
 */
class ContentValidator {
    /**
     * Validate content for platform
     */
    static validateForPlatform(content, platform) {
        switch (platform) {
            case 'twitter':
                return this.validateTwitterContent(content);
            case 'linkedin':
                return this.validateLinkedInContent(content);
            case 'github':
                return this.validateGitHubContent(content);
            default:
                return true;
        }
    }
    /**
     * Validate Twitter content
     */
    static validateTwitterContent(content) {
        if (content.content.length > 280)
            return false;
        // Check mention limits
        const mentions = content.content.match(/@\w+/g) || [];
        if (mentions.length > 10)
            return false;
        // Check hashtag limits
        const hashtags = content.content.match(/#\w+/g) || [];
        if (hashtags.length > 10)
            return false;
        return true;
    }
    /**
     * Validate LinkedIn content
     */
    static validateLinkedInContent(content) {
        if (content.content.length > 3000)
            return false;
        return true;
    }
    /**
     * Validate GitHub content
     */
    static validateGitHubContent(content) {
        if (content.content.length > 65536)
            return false;
        return true;
    }
}
exports.ContentValidator = ContentValidator;
/**
 * Content transformation utilities
 */
class ContentTransformer {
    /**
     * Transform content for platform
     */
    static transformForPlatform(content, platform) {
        const transformed = { ...content };
        switch (platform) {
            case 'twitter':
                return this.transformForTwitter(transformed);
            case 'linkedin':
                return this.transformForLinkedIn(transformed);
            case 'github':
                return this.transformForGitHub(transformed);
            default:
                return transformed;
        }
    }
    /**
     * Transform content for Twitter
     */
    static transformForTwitter(content) {
        // Add hashtags if specified
        if (content.tags && content.tags.length > 0) {
            const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
            content.content = `${content.content} ${hashtags}`;
        }
        // Add mentions if specified
        if (content.mentions && content.mentions.length > 0) {
            const mentions = content.mentions.map(mention => `@${mention}`).join(' ');
            content.content = `${mentions} ${content.content}`;
        }
        // Truncate if too long
        if (content.content.length > 280) {
            content.content = content.content.substring(0, 277) + '...';
        }
        return content;
    }
    /**
     * Transform content for LinkedIn
     */
    static transformForLinkedIn(content) {
        // LinkedIn supports longer content, so we can be more descriptive
        if (content.tags && content.tags.length > 0) {
            const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
            content.content = `${content.content}\n\n${hashtags}`;
        }
        return content;
    }
    /**
     * Transform content for GitHub
     */
    static transformForGitHub(content) {
        // GitHub uses Markdown, so we can format accordingly
        if (content.metadata?.type === 'issue' && !content.metadata.title) {
            // Extract title from first line
            const lines = content.content.split('\n');
            content.metadata.title = lines[0].substring(0, 100);
            content.content = lines.slice(1).join('\n');
        }
        return content;
    }
}
exports.ContentTransformer = ContentTransformer;
/**
 * Rate limiting utilities
 */
class RateLimitHelper {
    /**
     * Calculate delay for exponential backoff
     */
    static calculateBackoffDelay(attempt, baseDelay = 1000) {
        return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
    }
    /**
     * Calculate delay for linear backoff
     */
    static calculateLinearDelay(attempt, baseDelay = 1000) {
        return baseDelay * (attempt + 1);
    }
    /**
     * Check if rate limit is exceeded
     */
    static isRateLimited(rateLimitInfo) {
        if (!rateLimitInfo)
            return false;
        return rateLimitInfo.remaining <= 0 && new Date() < rateLimitInfo.reset;
    }
    /**
     * Get time until rate limit reset
     */
    static getTimeUntilReset(rateLimitInfo) {
        if (!rateLimitInfo || !rateLimitInfo.reset)
            return 0;
        return Math.max(0, rateLimitInfo.reset.getTime() - Date.now());
    }
}
exports.RateLimitHelper = RateLimitHelper;
/**
 * Configuration utilities
 */
class ConfigHelper {
    /**
     * Merge configurations
     */
    static mergeConfigs(base, override) {
        return {
            ...base,
            ...override,
            auth: {
                ...base.auth,
                ...override.auth,
                credentials: {
                    ...base.auth?.credentials,
                    ...override.auth?.credentials
                }
            },
            rateLimit: {
                ...base.rateLimit,
                ...override.rateLimit
            },
            retry: {
                ...base.retry,
                ...override.retry
            },
            settings: {
                ...base.settings,
                ...override.settings
            }
        };
    }
    /**
     * Validate configuration completeness
     */
    static validateConfig(config) {
        const errors = [];
        if (!config.platform)
            errors.push('Platform is required');
        if (!config.name)
            errors.push('Name is required');
        if (!config.version)
            errors.push('Version is required');
        if (!config.auth)
            errors.push('Auth configuration is required');
        if (!config.auth?.type)
            errors.push('Auth type is required');
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Sanitize configuration for logging
     */
    static sanitizeConfig(config) {
        const sanitized = { ...config };
        // Remove sensitive information
        if (sanitized.auth?.credentials) {
            sanitized.auth.credentials = Object.keys(sanitized.auth.credentials).reduce((acc, key) => {
                acc[key] = '***';
                return acc;
            }, {});
        }
        return sanitized;
    }
}
exports.ConfigHelper = ConfigHelper;
/**
 * URL and link utilities
 */
class UrlHelper {
    /**
     * Extract URLs from text
     */
    static extractUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.match(urlRegex) || [];
    }
    /**
     * Shorten URLs for platforms with character limits
     */
    static shortenUrls(text, maxLength = 23) {
        const urls = this.extractUrls(text);
        let result = text;
        urls.forEach(url => {
            if (url.length > maxLength) {
                const shortened = url.substring(0, maxLength - 3) + '...';
                result = result.replace(url, shortened);
            }
        });
        return result;
    }
    /**
     * Build platform-specific URLs
     */
    static buildPlatformUrl(platform, type, id) {
        switch (platform) {
            case 'twitter':
                return `https://twitter.com/user/status/${id}`;
            case 'linkedin':
                return `https://www.linkedin.com/feed/update/${id}`;
            case 'github':
                return `https://github.com/${id}`;
            default:
                return '';
        }
    }
}
exports.UrlHelper = UrlHelper;
/**
 * Error handling utilities
 */
class ErrorHelper {
    /**
     * Create standardized error response
     */
    static createErrorResult(error, metadata) {
        return {
            success: false,
            error: typeof error === 'string' ? error : error.message,
            metadata,
            timestamp: new Date()
        };
    }
    /**
     * Check if error is rate limit related
     */
    static isRateLimitError(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('rate limit') ||
            message.includes('too many requests') ||
            error.status === 429;
    }
    /**
     * Check if error is authentication related
     */
    static isAuthError(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('unauthorized') ||
            message.includes('authentication') ||
            error.status === 401;
    }
    /**
     * Get retry delay from error
     */
    static getRetryDelay(error) {
        if (error.retryAfter) {
            return error.retryAfter * 1000; // Convert to milliseconds
        }
        if (this.isRateLimitError(error)) {
            return 60000; // 1 minute default for rate limits
        }
        return 5000; // 5 seconds default
    }
}
exports.ErrorHelper = ErrorHelper;
/**
 * Analytics utilities
 */
class AnalyticsHelper {
    /**
     * Calculate engagement rate
     */
    static calculateEngagementRate(metrics) {
        const { likes = 0, shares = 0, comments = 0, views = 0 } = metrics;
        if (views === 0)
            return 0;
        const totalEngagement = likes + shares + comments;
        return (totalEngagement / views) * 100;
    }
    /**
     * Aggregate metrics from multiple platforms
     */
    static aggregateMetrics(metricsMap) {
        const aggregated = {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            impressions: 0,
            reach: 0
        };
        metricsMap.forEach(metrics => {
            Object.keys(aggregated).forEach(key => {
                if (metrics[key]) {
                    aggregated[key] += metrics[key];
                }
            });
        });
        return {
            ...aggregated,
            engagement: this.calculateEngagementRate(aggregated),
            platforms: metricsMap.size
        };
    }
}
exports.AnalyticsHelper = AnalyticsHelper;
//# sourceMappingURL=index.js.map